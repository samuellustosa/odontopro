// src/app/api/whatsapp/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { canPermission } from '@/utils/permissions/canPermission';
import { getChatbotConfig } from '@/app/(panel)/dashboard/chatbot/_data-access/get-config';
import { createNewAppointment } from '@/app/(public)/empresa/[id]/_actions/create-appointment';
import { getInfoSchedule } from '@/app/(public)/empresa/[id]/_data-access/get-info-schedule';
import OpenAI from 'openai';

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
        date: string; // A data virá como string da API
        time: string;
        serviceId: string;
        name: string;
        email: string;
        phone: string;
    };
}

type GPTResponse = GPTResponseDefault | GPTResponseCreateAppointment;

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Função para chamar a API do GPT e obter uma resposta estruturada
async function getGPTResponse(prompt: string, personality: string, context: any): Promise<GPTResponse> {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: `Você é um assistente virtual com a seguinte personalidade: "${personality}". Sua tarefa é auxiliar no agendamento de consultas. O contexto da empresa é: ${JSON.stringify(context)}. Você deve extrair as informações da conversa e, se todas as informações para um agendamento forem obtidas (nome, email, telefone, data, serviço, horário), retorne um JSON com a ação 'create_appointment'. Caso contrário, continue a conversa para obter as informações faltantes. O formato de data deve ser 'yyyy-mm-dd' e o de horário 'HH:mm'. O telefone deve incluir o DDD e ser apenas números.`,
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            response_format: { type: "json_object" },
        });

        const gptResponseContent = JSON.parse(response.choices[0].message.content as string);

        if (gptResponseContent) {
            return gptResponseContent;
        } else {
            console.error('Erro ao processar a resposta do GPT:', response);
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

        // VALIDAÇÃO: Verifica se o horário está disponível antes de agendar
        const blockedTimesResponse = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/schedule/get-appointments?userId=${userId}&date=${date}`);
        const blockedTimes = await blockedTimesResponse.json();
        
        const serviceDuration = empresa.services.find(s => s.id === serviceId)?.duration || 0;
        const requiredSlots = Math.ceil(serviceDuration / 30);
        const isAvailable = isSlotSequenceAvailable(time, requiredSlots, empresa.times, blockedTimes);

        if (!isAvailable) {
            await sendWhatsAppMessage(clientNumber, "Desculpe, o horário solicitado não está mais disponível. Por favor, escolha outro.");
            return NextResponse.json({ success: false, message: 'Horário indisponível.' });
        }

        const newAppointment = await createNewAppointment({
            empresaId: userId,
            date: new Date(date), // Converte a string para um objeto Date
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

// Função de utilidade para checar a disponibilidade dos slots
function isSlotSequenceAvailable(
  startSlot: string,
  requiredSlots: number,
  allSlots: string[],
  blockedSlots: string[]
) {
    const startIndex = allSlots.indexOf(startSlot);
    if (startIndex === -1 || startIndex + requiredSlots > allSlots.length) {
        return false;
    }

    for (let i = startIndex; i < startIndex + requiredSlots; i++) {
        const slotTime = allSlots[i];
        if (blockedSlots.includes(slotTime)) {
            return false;
        }
    }

    return true;
}