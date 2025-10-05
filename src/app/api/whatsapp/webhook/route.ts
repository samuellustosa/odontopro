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


// Simulação de chamada ao GPT com o novo tipo de retorno
async function getGPTResponse(prompt: string, personality: string, context: any): Promise<GPTResponse> {
    // Implemente a lógica real de chamada à API do GPT aqui
    console.log(`Chamando GPT com prompt: ${prompt}`);
    console.log(`Personalidade do bot: ${personality}`);
    console.log('Contexto:', context);
    
    // Retorna uma resposta simulada para demonstração
    // Para fins de teste, você pode simular um agendamento retornando um objeto GPTResponseCreateAppointment
    
    // Exemplo de retorno para agendamento (descomente para testar)
    /*
    return {
        reply: "Consegui coletar todas as informações e já agendei o serviço.",
        action: 'create_appointment',
        data: {
            date: new Date(),
            time: "10:00",
            serviceId: "id-do-servico-aqui",
            name: "João da Silva",
            email: "joao@email.com",
            phone: "11999999999"
        }
    };
    */
    
    // Retorno padrão
    return {
        reply: "Olá! Como posso ajudá-lo a agendar seu atendimento?",
        action: null
    };
}

// Simulação da chamada da Evolution API para enviar mensagem
async function sendWhatsAppMessage(number: string, message: string) {
    console.log(`Enviando mensagem para ${number}: ${message}`);
    // Implemente a lógica real de envio de mensagem aqui
}

export async function POST(req: NextRequest) {
    const { instanceName, message, clientNumber, fromMe }: WebhookMessage = await req.json();

    // Ignorar mensagens enviadas pelo próprio bot
    if (fromMe) {
        return NextResponse.json({ success: true });
    }
    
    const userId = instanceName; // A Evolution API usa o nome da instância como identificador
    
    const permission = await canPermission({ type: 'chatbot' });
    const config = await getChatbotConfig({ userId });
    
    if (!permission.hasPermission || !config?.enabled) {
        // Se o chatbot não estiver ativo ou o usuário não tiver permissão, não processar
        return NextResponse.json({ success: false, message: 'Chatbot inativo.' });
    }

    // Obter contexto da empresa
    const empresa = await getInfoSchedule({ userId });
    if (!empresa) {
        return NextResponse.json({ success: false, message: 'Empresa não encontrada.' });
    }

    // Passar a mensagem do cliente para o GPT para processamento
    const gptResponse = await getGPTResponse(message, config.personality, {
        services: empresa.services,
        times: empresa.times,
        name: empresa.name,
    });
    
    // Processar a resposta da IA
    if (gptResponse.action === 'create_appointment') {
        // A propriedade 'data' agora é garantida pelo tipo `GPTResponseCreateAppointment`
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