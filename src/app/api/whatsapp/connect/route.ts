// src/app/api/whatsapp/connect/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const { userId } = await req.json();

    if (!userId) {
        return NextResponse.json({ error: "ID do usuário não fornecido." }, { status: 400 });
    }

    // Seu URL do Ngrok (Substitua se ele mudar!)
    const ngrokUrl = `https://carmelia-dermatophytic-royally.ngrok-free.app`;
    
    try {
        const evolutionApiUrl = `${process.env.EVOLUTION_API_URL}/instance/create`;
        const evolutionApiKey = process.env.EVOLUTION_API_KEY;
        const evolutionInstanceName = `instance-${userId}`; 

        const payload = {
            instanceName: evolutionInstanceName,
            token: "",
            qrcode: true,
            // CORREÇÃO: O campo 'number' foi removido para evitar o erro de validação.
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
                byEvents: true,
                base64: true,
                headers: {
                    authorization: "",
                    "Content-Type": "application/json"
                },
                events: [
                    "QRCODE_UPDATED", 
                    "MESSAGES_UPSERT"
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
        
        console.log('Status HTTP da resposta:', response.status);
        console.log('Resposta completa da Evolution API:', responseBody);

        if (!response.ok) {
            const errorMessage = responseBody.message 
                ? responseBody.message.toString() 
                : "A requisição foi rejeitada. Verifique se o EVOLUTION_API_KEY no .env está correto e se a Evolution API está rodando na porta 8081.";

            return NextResponse.json({ error: errorMessage || "Falha ao gerar QR Code." }, { status: 500 });
        }
        
        let qrCodeUrl = null;

        if (responseBody.instance?.qrCode) {
            const qrCodeData = responseBody.instance.qrCode;

            if (qrCodeData.startsWith('http')) {
                qrCodeUrl = qrCodeData;
            } else {
                qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(qrCodeData)}`;
            }
        }
        
        return NextResponse.json({ 
            qrCodeUrl: qrCodeUrl,
            message: qrCodeUrl ? "QR Code gerado com sucesso!" : "Instância criada. Aguardando QR Code via webhook."
        });

    } catch (err) {
        console.error('Erro ao gerar QR Code:', err);
        return NextResponse.json({ error: "Falha de conexão com a API." }, { status: 500 });
    }
}