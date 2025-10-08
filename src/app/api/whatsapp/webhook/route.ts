import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getChatbotConfig } from '@/app/(panel)/dashboard/chatbot/_data-access/get-config';
import { createNewAppointment } from '@/app/(public)/empresa/[id]/_actions/create-appointment';
import { getInfoSchedule } from '@/app/(public)/empresa/[id]/_data-access/get-info-schedule';
import { isSlotSequenceAvailable } from '@/app/(public)/empresa/[id]/_components/schedule-utils';
import OpenAI from 'openai';
import { revalidatePath } from 'next/cache';
import { ConnectionStatus } from '@/generated/prisma';

// Tipos do payload da Evolution API
interface WebhookPayload {
  instance?: string;
  event?: string;
  data?: any;
  message?: { text?: string; id?: string };
  clientNumber?: string;
  fromMe?: boolean;
}

// Tipos da resposta do GPT
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

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ===========================================
// 🔹 Função auxiliar: GPT Response
// ===========================================
async function getGPTResponse(prompt: string, personality: string, context: any): Promise<GPTResponse> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Você é um assistente virtual com a seguinte personalidade: "${personality}". Sua tarefa é auxiliar no agendamento de consultas. O contexto da empresa é: ${JSON.stringify(context)}.`,
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content as string);
  } catch (err) {
    console.error('Erro ao conectar com a API do GPT:', err);
    return {
      reply: 'Desculpe, ocorreu um erro interno. Tente novamente mais tarde.',
      action: null,
    };
  }
}

// ===========================================
// 🔹 Função auxiliar: enviar mensagem via Evolution API
// ===========================================
async function sendWhatsAppMessage(instanceName: string, number: string, message: string) {
  const url = `${process.env.EVOLUTION_API_URL}/message/sendText/${instanceName}`;
  const apiKey = process.env.EVOLUTION_API_KEY;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: apiKey as string,
      },
      body: JSON.stringify({ number, textMessage: { text: message } }),
    });

    if (!res.ok) {
      console.error('Erro ao enviar mensagem:', await res.text());
    }
  } catch (err) {
    console.error('Falha ao conectar com a Evolution API:', err);
  }
}

// ===========================================
// 🔹 Endpoint principal: Webhook
// ===========================================
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  const apiKey = process.env.EVOLUTION_API_KEY;

  if (!authHeader || authHeader !== `Bearer ${apiKey}`) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const payload: WebhookPayload = await req.json();
  console.log('📩 Webhook recebido:', JSON.stringify(payload, null, 2));

  const { instance, event, data, message, clientNumber, fromMe } = payload;
  if (!instance) return NextResponse.json({ error: 'Instância não fornecida.' }, { status: 400 });

  const userId = instance.replace('instance-', '');

  // ===========================================
  // 🟣 Eventos de conexão e QR Code
  // ===========================================
  const eventName = event?.toLowerCase();

  if (eventName === 'qrcode.updated') {
    console.log('🟡 QR Code atualizado');
    // A propriedade 'qrcode' (newQrCode) da Evolution API é um objeto que contém a string 'base64'.
    // Como o campo qrCodeUrl no Prisma é 'String?', precisamos salvar apenas a string 'base64'.
    const newQrCodeData = data?.qrcode;
    const qrCodeBase64String = newQrCodeData?.base64 || null; // <--- CORREÇÃO APLICADA AQUI

    await prisma.chatbotConfig.update({
      where: { userId },
      data: {
        qrCodeUrl: qrCodeBase64String, // Agora salva apenas a string base64 ou null
        connectionStatus: qrCodeBase64String ? 'PENDING' : 'DISCONNECTED',
      },
    });

    revalidatePath('/dashboard/chatbot');
    return NextResponse.json({ success: true });
  }

  if (eventName === 'connection.update' && data?.state === 'open') {
    console.log('🟢 Conexão estabelecida (connection.update)');
    await prisma.chatbotConfig.update({
      where: { userId },
      data: { connectionStatus: 'CONNECTED', qrCodeUrl: null },
    });

    revalidatePath('/dashboard/chatbot');
    return NextResponse.json({ success: true });
  }

  if (eventName === 'connection.ready') {
    console.log('🟢 Conexão pronta (connection.ready)');
    await prisma.chatbotConfig.update({
      where: { userId },
      data: { connectionStatus: 'CONNECTED', qrCodeUrl: null },
    });

    revalidatePath('/dashboard/chatbot');
    return NextResponse.json({ success: true });
  }

  // ===========================================
  // 💬 Processar mensagens recebidas
  // ===========================================
  const config = await getChatbotConfig({ userId });
  if (!config || fromMe || !message?.text) {
    return NextResponse.json({ success: true });
  }

  if (config.lastMessageId === message.id) {
    return NextResponse.json({ success: true });
  }

  if (!config.enabled) {
    return NextResponse.json({ success: false, message: 'Chatbot inativo.' });
  }

  const empresa = await getInfoSchedule({ userId });
  if (!empresa) {
    return NextResponse.json({ success: false, message: 'Empresa não encontrada.' });
  }

  await prisma.chatbotConfig.update({
    where: { userId },
    data: { lastMessageId: message.id },
  });

  const gptResponse = await getGPTResponse(message.text, config.personality, empresa);

  // ===========================================
  // 📅 Criar agendamento se solicitado
  // ===========================================
  if (gptResponse.action === 'create_appointment') {
    const { date, time, serviceId, name, email, phone } = gptResponse.data;

    // Nota: Recomenda-se usar fetch/axios diretamente aqui ou mover esta lógica para um service/action
    // para evitar a dependência de NEXT_PUBLIC_URL e melhorar a modularidade.
    const blockedTimesResponse = await fetch(
      `${process.env.NEXT_PUBLIC_URL}/api/schedule/get-appointments?userId=${userId}&date=${date}`
    );
    const blockedTimes = await blockedTimesResponse.json();

    const serviceDuration = empresa.services.find((s: any) => s.id === serviceId)?.duration || 0;
    const requiredSlots = Math.ceil(serviceDuration / 30);
    const isAvailable = isSlotSequenceAvailable(time, requiredSlots, empresa.times, blockedTimes);

    if (!isAvailable) {
      await sendWhatsAppMessage(instance, clientNumber!, 'Desculpe, o horário solicitado não está disponível.');
      return NextResponse.json({ success: false });
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
      await sendWhatsAppMessage(instance, clientNumber!, 'Erro ao criar o agendamento. Tente novamente.');
    } else {
      await sendWhatsAppMessage(instance, clientNumber!, '✅ Seu agendamento foi realizado com sucesso!');
    }
  } else {
    await sendWhatsAppMessage(instance, clientNumber!, gptResponse.reply);
  }

  return NextResponse.json({ success: true });
}
