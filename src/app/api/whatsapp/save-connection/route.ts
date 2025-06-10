// src/app/api/whatsapp/save-connection/route.ts
import { NextRequest, NextResponse } from 'next/server';
import getSession from '@/lib/getSession';
import prisma from '@/lib/prisma'; // Importe seu cliente Prisma

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    const { instanceId, status, qrCode } = await request.json(); // qrCode pode ser opcional ao salvar status

    if (!instanceId || !status) {
      return NextResponse.json({ error: 'instanceId e status são obrigatórios' }, { status: 400 });
    }

    // Determinar connectedAt baseado no status
    const currentConnectedAt = (status === 'connected' || status === 'open') ? new Date() : null;

    const whatsAppInstance = await prisma.whatsAppInstance.upsert({
      where: { instanceId: instanceId }, // Tenta encontrar pelo instanceId (que é o userId_timestamp)
      update: {
        status: status,
        qrCode: qrCode || null,
        connectedAt: currentConnectedAt,
        updatedAt: new Date(),
      },
      create: {
        instanceId: instanceId,
        status: status,
        qrCode: qrCode || null,
        connectedAt: currentConnectedAt,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true, whatsAppInstance });

  } catch (error: any) {
    console.error('Erro ao salvar status da conexão WhatsApp:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor ao salvar status da conexão WhatsApp', details: error.message },
      { status: 500 }
    );
  }
}