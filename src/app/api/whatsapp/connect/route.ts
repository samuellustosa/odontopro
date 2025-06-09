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

    // URL do webhook do n8n para obter QR Code (configurado na Fase 2)
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_CONNECT_URL
    if (!n8nWebhookUrl) {
      return NextResponse.json(
        { error: 'Configuração do n8n para conexão não encontrada' },
        { status: 500 }
      )
    }

    // Dados para enviar ao n8n (userId será usado como instanceName na Evolution API)
    const payload = {
      userId: session.user.id,
      userEmail: session.user.email,
      action: 'connect_whatsapp',
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

    // Retornar os dados do QR Code e instanceId
    return NextResponse.json({
      success: true,
      qrCode: data.qrCode,         // Base64 ou URL da imagem
      instanceId: data.instanceId, // ID da instância
      status: data.status,         // Status inicial da instância
      message: 'QR Code gerado com sucesso',
    })
  } catch (error: any) {
    console.error('Erro ao conectar WhatsApp:', error)
    return NextResponse.json(
      {
        error: 'Erro interno do servidor ao conectar WhatsApp',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
