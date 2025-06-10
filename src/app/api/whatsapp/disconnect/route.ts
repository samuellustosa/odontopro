// src/app/api/whatsapp/disconnect/route.ts
import { NextRequest, NextResponse } from 'next/server';
import getSession from '@/lib/getSession';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    const { instanceId } = await request.json(); // Recebe o instanceId do frontend

    if (!instanceId) {
      return NextResponse.json({ error: 'instanceId é obrigatório para desconectar' }, { status: 400 });
    }

    // URL do webhook do n8n para desconectar (COLE AQUI O URL DO SEU NOVO WORKFLOW DO N8N)
    const n8nDisconnectWebhookUrl = process.env.N8N_WEBHOOK_DISCONNECT_URL; // Defina esta variável no .env.local
    if (!n8nDisconnectWebhookUrl) {
      console.error('N8N_WEBHOOK_DISCONNECT_URL não configurado.');
      return NextResponse.json({ error: 'Configuração do n8n para desconexão não encontrada' }, { status: 500 });
    }

    // Chamar o webhook do n8n para desconectar
    const response = await fetch(n8nDisconnectWebhookUrl, {
      method: 'POST', // O n8n webhook é POST
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ instanceId }), // Envia o instanceId para o n8n
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erro de comunicação com n8n para desconectar:', response.status, errorData);
      throw new Error(`Erro n8n desconexão: ${response.status} ${errorData.message || JSON.stringify(errorData)}`);
    }

    const data = await response.json(); // Resposta do n8n (que veio da Evolution API)
    console.log('API /disconnect: Resposta do n8n para desconexão:', data);

    return NextResponse.json({ success: true, message: 'Comando de desconexão enviado.' });

  } catch (error: any) {
    console.error('Erro ao desconectar WhatsApp na API:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor ao desconectar WhatsApp', details: error.message },
      { status: 500 }
    );
  }
}