// src/app/api/whatsapp/load-connection/route.ts
import { NextRequest, NextResponse } from 'next/server';
import getSession from '@/lib/getSession';
import prisma from '@/lib/prisma'; // Importe seu cliente Prisma

export async function POST(request: NextRequest) { // Usamos POST para enviar userId no body se necessário
  try {
    const session = await getSession();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    // Pelo seu fluxo, o instanceId é o userId com timestamp.
    // Vamos buscar a instância mais recente para o userId logado.
    const whatsAppInstance = await prisma.whatsAppInstance.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }, // Pega a mais recente se houver várias
    });

    if (whatsAppInstance) {
      return NextResponse.json({
        success: true,
        status: whatsAppInstance.status,
        instanceId: whatsAppInstance.instanceId,
        qrCode: whatsAppInstance.qrCode,
        message: 'Status da conexão carregado.'
      });
    } else {
      return NextResponse.json({ success: false, message: 'Nenhuma conexão encontrada para este usuário.' });
    }

  } catch (error: any) {
    console.error('Erro ao carregar status da conexão WhatsApp:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor ao carregar status da conexão WhatsApp', details: error.message },
      { status: 500 }
    );
  }
}