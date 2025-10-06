// samuellustosa/odontopro/odontopro-e6e4f7d9d3adfc3f329b72bde2fd08fe3ae63e48/src/app/api/whatsapp/connect/route.ts
import { NextResponse, NextRequest } from 'next/server';
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
    const { userId } = await req.json();

    if (!userId) {
        return NextResponse.json({ error: "ID do usuário não fornecido." }, { status: 400 });
    }

    const ngrokUrl = process.env.NEXT_PUBLIC_URL;
    if (!ngrokUrl) {
        return NextResponse.json({ error: "Variável de ambiente NEXT_PUBLIC_URL não está definida." }, { status: 500 });
    }

    try {
        const evolutionApiUrl = `${process.env.EVOLUTION_API_URL}/instance/create`;
        const evolutionApiKey = process.env.EVOLUTION_API_KEY;
        const evolutionInstanceName = `instance-${userId}`; 

        const payload = {
            instanceName: evolutionInstanceName,
            token: "",
            qrcode: true,
            integration: "WHATSAPP-BAILEYS",
            rejectCall: true,
            msgCall: "Olá, não podemos atender chamadas. Por favor, envie uma mensagem!",
            groupsIgnore: true,
            alwaysOnline: true,
            readMessages: true,
            readStatus: true,
            syncFullHistory: true,
            proxyHost: "",
            proxyPort: "",
            proxyProtocol: "",
            proxyUsername: "",
            proxyPassword: "",
            webhook: {
                url: `${ngrokUrl}/api/whatsapp/webhook`,
                byEvents: false,
                base64: true,
                headers: {
                    authorization: `Bearer ${process.env.EVOLUTION_API_KEY}`, // Adicionado para segurança
                    "Content-Type": "application/json"
                },
                events: [
                    "QRCODE_UPDATED", 
                    "MESSAGES_UPSERT",
                    "CONNECTION_UPDATE", // Adicionado para monitorar o status
                    "CONNECTION_READY" // Adicionado para indicar conexão estabelecida
                ]
            },
            rabbitmq: {
                enabled: false,
                events: []
            },
            sqs: {
                enabled: false,
                events: []
            },
            chatwootAccountId: "0", 
            chatwootToken: "",
            chatwootUrl: "",
            chatwootSignMsg: false,
            chatwootReopenConversation: false,
            chatwootConversationPending: false,
            chatwootImportContacts: false,
            chatwootNameInbox: "",
            chatwootMergeBrazilContacts: false,
            chatwootImportMessages: false,
            chatwootDaysLimitImportMessages: 0,
            chatwootOrganization: "",
            chatwootLogo: ""
        };

        const response = await fetch(evolutionApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': evolutionApiKey as string,
            },
            body: JSON.stringify(payload),
        });

        const responseBody = await response.json();
        
        if (!response.ok) {
            const errorMessage = responseBody.message 
                ? responseBody.message.toString() 
                : "A requisição foi rejeitada. Verifique se o EVOLUTION_API_KEY no .env está correto e se a Evolution API está rodando na porta 8081.";

            return NextResponse.json({ error: errorMessage || "Falha ao gerar QR Code." }, { status: 500 });
        }
        
        let qrCodeUrl = null;
        if (responseBody.qrcode?.base64) {
            qrCodeUrl = responseBody.qrcode.base64;
            // Atualiza o banco de dados com o QR Code inicial
            await prisma.chatbotConfig.upsert({
                where: { userId: userId },
                update: { qrCodeUrl: qrCodeUrl, connectionStatus: "PENDING" },
                create: { userId: userId, qrCodeUrl: qrCodeUrl, connectionStatus: "PENDING", name: "Assistente Virtual" },
            });
        }
        
        return NextResponse.json({ 
            qrCodeUrl: qrCodeUrl,
            message: qrCodeUrl ? "QR Code gerado com sucesso! Escaneie para conectar." : "Instância criada. Aguardando QR Code via webhook."
        });

    } catch (err) {
        console.error('Erro ao gerar QR Code:', err);
        return NextResponse.json({ error: "Falha de conexão com a API." }, { status: 500 });
    }
}