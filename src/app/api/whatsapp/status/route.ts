import { NextRequest, NextResponse } from 'next/server'
import getSession from '@/lib/getSession'

export async function POST (request: NextRequest) {
  try {
    // Verificar se o usuário está autenticado
    const session = await getSession()
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    // Obter o instanceId do corpo da requisição
    const { instanceId } = await request.json()
    if (!instanceId) {
      return NextResponse.json (
        { error: 'instanceId é obrigatório para verificar o status' },
        { status: 400 }
      )
    }

    // URL do webhook do n8n para verificar status (configurado na Fase 2)
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_STATUS_URL
    if (!n8nWebhookUrl) {
      return NextResponse.json(
        { error: 'Configuração do n8n para status não encontrada' },
        { status: 500 }
      )
    }

    // Dados para enviar ao n8n
    const payload = {
      userId: session.user.id,
      instanceId: instanceId,
      action: 'check_status'
    }

    // Chamar o webhook do n8n
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API /api/whatsapp/status: Erro na comunicação com n8n:', response.status, errorData);
      throw new Error(`Erro na comunicação com n8n para status: ${response.status} ${errorData.message || JSON.stringify(errorData)}`)
    }

    const data = await response.json() // Esta 'data' contém o JSON que o n8n enviou

    // NOVO CONSOLE.LOG PARA DEBUG
    console.log('API /api/whatsapp/status: Dados recebidos do n8n:', data);

    // *** ALTERAÇÃO AQUI: Extrair o status da propriedade 'state' ou 'instance.state' ***
    // A Evolution API retorna o status em 'state' dentro de 'instance'.
    // O n8n pode ter removido o wrapper 'instance' ou não.
    // Vamos tentar data.state primeiro. Se não funcionar, data.instance.state.
    const currentStatus = data.state || (data.instance ? data.instance.state : undefined);

    // Retornar o status da conexão
    return NextResponse.json({
      success: true,
      status: currentStatus, // Usar o status extraído de 'state'
      message: data.message || `Status da instância: ${currentStatus}` // Ajuste a mensagem para refletir
    })

  } catch (error: any) {
    console.error('Erro ao verificar status WhatsApp na API:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor ao verificar status WhatsApp', details: error.message },
      { status: 500 }
    )
  }
}