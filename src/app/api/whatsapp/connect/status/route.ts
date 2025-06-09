import { NextRequest, NextResponse } from 'next/server'
import getSession from '@/lib/getSession'

export async function POST(request: NextRequest) {
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
      return NextResponse.json(
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
      action: 'check_status',
    }

    // Chamar o webhook do n8n
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(
        `Erro na comunicação com n8n: ${response.status} - ${
          errorData.message || JSON.stringify(errorData)
        }`
      )
    }

    const data = await response.json()

    // Retornar o status da conexão
    return NextResponse.json({
      success: true,
      status: data.status, // ex: 'connected', 'disconnected', 'qr_code_scanned'
      message: data.message || 'Status verificado com sucesso',
    })
  } catch (error: any) {
    console.error('Erro ao verificar status WhatsApp:', error)
    return NextResponse.json(
      {
        error: 'Erro interno do servidor ao verificar status WhatsApp',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
