// src/app/api/whatsapp/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { canPermission } from '@/utils/permissions/canPermission';
import { getChatbotConfig } from '@/app/(panel)/dashboard/chatbot/_data-access/get-config';
import { createNewAppointment } from '@/app/(public)/empresa/[id]/_actions/create-appointment';
import { getInfoSchedule } from '@/app/(public)/empresa/[id]/_data-access/get-info-schedule';

// Simulação da chamada da Evolution API
interface WebhookMessage {
    instanceName: string;
    message: string;
    clientNumber: string;
    fromMe: boolean;
}

// Definindo os tipos para a resposta do GPT
interface GPTResponseDefault {
    reply: string;
    action: null;
}

interface GPTResponseCreateAppointment {
    reply: string;
    action: 'create_appointment';
    data: {
        date: Date;
        time: string;
        serviceId: string;
        name: string;
        email: string;
        phone: string;
    };
}

type GPTResponse = GPTResponseDefault | GPTResponseCreateAppointment;


// Função para chamar a API do GPT e obter uma resposta estruturada
async function getGPTResponse(prompt: string, personality: string, context: any): Promise<GPTResponse> {
    // Implemente a lógica real de chamada à API do GPT aqui.
    // Exemplo usando a API do OpenAI
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o', // Ou outro modelo de sua escolha
                messages: [
                    {
                        role: 'system',
                        content: `Você é um assistente virtual com a seguinte personalidade: "${personality}". Sua tarefa é auxiliar no agendamento de consultas. O contexto da empresa é: ${JSON.stringify(context)}. Você deve extrair as informações da conversa e, se todas as informações para um agendamento forem obtidas (nome, email, telefone, data, serviço, horário), retorne um JSON com a ação 'create_appointment'. Caso contrário, continue a conversa para obter as informações faltantes.`,
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                response_format: { type: "json_object" }, // Importante para garantir a resposta em JSON
            }),
        });

        const gptData = await response.json();
        // A API da OpenAI retorna a resposta dentro de 'choices[0].message.content'
        const gptResponseContent = JSON.parse(gptData.choices[0].message.content);

        if (response.ok && gptResponseContent) {
            return gptResponseContent;
        } else {
            console.error('Erro ao chamar a API do GPT:', gptData);
            return {
                reply: "Desculpe, não consegui processar sua solicitação no momento. Poderia tentar novamente?",
                action: null
            };
        }

    } catch (err) {
        console.error('Erro ao conectar com a API do GPT:', err);
        return {
            reply: "Desculpe, ocorreu um erro na nossa comunicação interna. Tente novamente mais tarde.",
            action: null
        };
    }
}

// Função para chamar a API de Mensagens do WhatsApp (substitua pela sua)
async function sendWhatsAppMessage(number: string, message: string) {
    console.log(`Enviando mensagem para ${number}: ${message}`);
    // Exemplo de chamada para a Evolution API
    const evolutionApiUrl = `${process.env.EVOLUTION_API_URL}/message/sendText/evolution-instance-name`;
    const evolutionApiKey = process.env.EVOLUTION_API_KEY;
    
    try {
        const response = await fetch(evolutionApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': evolutionApiKey as string,
            },
            body: JSON.stringify({
                number,
                textMessage: {
                    text: message
                }
            }),
        });

        if (!response.ok) {
            console.error('Erro ao enviar mensagem via Evolution API:', await response.json());
        }
    } catch (err) {
        console.error('Falha ao conectar com a Evolution API:', err);
    }
}

export async function POST(req: NextRequest) {
    const { instanceName, message, clientNumber, fromMe }: WebhookMessage = await req.json();

    // Ignorar mensagens enviadas pelo próprio bot
    if (fromMe) {
        return NextResponse.json({ success: true });
    }
    
    const userId = instanceName;
    const permission = await canPermission({ type: 'chatbot' });
    const config = await getChatbotConfig({ userId });
    
    if (!permission.hasPermission || !config?.enabled) {
        return NextResponse.json({ success: false, message: 'Chatbot inativo.' });
    }

    const empresa = await getInfoSchedule({ userId });
    if (!empresa) {
        return NextResponse.json({ success: false, message: 'Empresa não encontrada.' });
    }

    const gptResponse = await getGPTResponse(message, config.personality, {
        services: empresa.services,
        times: empresa.times,
        name: empresa.name,
    });
    
    if (gptResponse.action === 'create_appointment') {
        const { date, time, serviceId, name, email, phone } = gptResponse.data;
        const newAppointment = await createNewAppointment({
            empresaId: userId,
            date,
            time,
            serviceId,
            name,
            email,
            phone,
        });
        
        if (newAppointment.error) {
            await sendWhatsAppMessage(clientNumber, "Desculpe, ocorreu um erro ao agendar. Tente novamente mais tarde.");
        } else {
            await sendWhatsAppMessage(clientNumber, "Seu agendamento foi realizado com sucesso!");
        }
    } else {
        await sendWhatsAppMessage(clientNumber, gptResponse.reply);
    }

    return NextResponse.json({ success: true });
}