// src/app/api/whatsapp/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getChatbotConfig } from '@/app/(panel)/dashboard/chatbot/_data-access/get-config';
import { createNewAppointment } from '@/app/(public)/empresa/[id]/_actions/create-appointment';
import { getInfoSchedule } from '@/app/(public)/empresa/[id]/_data-access/get-info-schedule';
import OpenAI from 'openai';
import prisma from "@/lib/prisma";
import { isSlotSequenceAvailable } from '@/app/(public)/empresa/[id]/_components/schedule-utils';
import { ConnectionStatus } from '@/generated/prisma';

// Definindo os tipos para o payload do webhook da Evolution API
interface WebhookPayload {
    instance?: string;
    message?: {
        text?: string;
        id?: string;
    };
    clientNumber?: string;
    fromMe?: boolean;
    event?: string;
    data?: any;
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
        date: string;
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

async function sendWhatsAppMessage(instanceName: string, number: string, message: string) {
    const evolutionApiUrl = `${process.env.EVOLUTION_API_URL}/message/sendText/${instanceName}`;
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
    const evolutionApiKey = process.env.EVOLUTION_API_KEY;
    const authHeader = req.headers.get('Authorization');
    // Verificação de segurança aprimorada para o tipo 'string | undefined'
    if (!authHeader || authHeader !== `Bearer ${evolutionApiKey}`) {
        return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const payload: WebhookPayload = await req.json();
    const { instance, message, clientNumber, fromMe, event, data } = payload;

    if (!instance || typeof instance !== 'string') {
        return NextResponse.json({ error: "ID da instância não fornecido ou inválido no payload do webhook." }, { status: 400 });
    }

    const userId = instance.replace('instance-', '');

    if (event === 'QRCODE_UPDATED') {
        const newQrCode = data?.qrcode || null;
        await prisma.chatbotConfig.update({
            where: { userId },
            data: {
                qrCodeUrl: newQrCode,
                connectionStatus: newQrCode ? "PENDING" : "DISCONNECTED" as ConnectionStatus
            },
        });
        return NextResponse.json({ success: true });
    } else if (event === 'CONNECTION_UPDATE' && data?.state === 'open') {
        await prisma.chatbotConfig.update({
            where: { userId },
            data: { connectionStatus: "CONNECTED" as ConnectionStatus, qrCodeUrl: null },
        });
        return NextResponse.json({ success: true });
    }

    const config = await getChatbotConfig({ userId });

    if (fromMe || !message?.text) {
        return NextResponse.json({ success: true });
    }
    
    // Adicione a verificação para clientNumber
    if (!clientNumber) {
        return NextResponse.json({ error: "Número do cliente não fornecido." }, { status: 400 });
    }

    if (config?.lastMessageId === message.id) {
        return NextResponse.json({ success: true });
    }

    if (!config?.enabled) {
        return NextResponse.json({ success: false, message: 'Chatbot inativo.' });
    }

    const userMessage = message.text;

    const empresa = await getInfoSchedule({ userId });
    if (!empresa) {
        return NextResponse.json({ success: false, message: 'Empresa não encontrada.' });
    }

    await prisma.chatbotConfig.update({
        where: { userId },
        data: { lastMessageId: message.id },
    });

    const gptResponse = await getGPTResponse(userMessage, config.personality, {
        services: empresa.services,
        times: empresa.times,
        name: empresa.name,
    });

    if (gptResponse.action === 'create_appointment') {
        const { date, time, serviceId, name, email, phone } = gptResponse.data;

        const blockedTimesResponse = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/schedule/get-appointments?userId=${userId}&date=${date}`);
        const blockedTimes = await blockedTimesResponse.json();

        const serviceDuration = empresa.services.find(s => s.id === serviceId)?.duration || 0;
        const requiredSlots = Math.ceil(serviceDuration / 30);
        const isAvailable = isSlotSequenceAvailable(time, requiredSlots, empresa.times, blockedTimes);

        if (!isAvailable) {
            await sendWhatsAppMessage(instance, clientNumber, "Desculpe, o horário solicitado não está mais disponível. Por favor, escolha outro.");
            return NextResponse.json({ success: false, message: 'Horário indisponível.' });
        }

        const newAppointment = await createNewAppointment({
            empresaId: userId,
            date: new Date(date),
            time,
            serviceId,
            name,
            email,
            phone,
        });

        if (newAppointment.error) {
            await sendWhatsAppMessage(instance, clientNumber, "Desculpe, ocorreu um erro ao agendar. Tente novamente mais tarde.");
        } else {
            await sendWhatsAppMessage(instance, clientNumber, "Seu agendamento foi realizado com sucesso!");
        }
    } else {
        await sendWhatsAppMessage(instance, clientNumber, gptResponse.reply);
    }

    return NextResponse.json({ success: true });
}