// src/app/api/chatbot/save-config/route.ts
import { NextRequest, NextResponse } from 'next/server';
import getSession from '@/lib/getSession';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    const { name, personality, enabled } = await request.json();

    if (!name || !personality || typeof enabled !== 'boolean') {
      return NextResponse.json({ error: 'Todos os campos de configuração do chatbot são obrigatórios.' }, { status: 400 });
    }

    const chatbotConfig = await prisma.chatbotConfig.upsert({
      where: { userId: session.user.id }, // Busca pela config do usuário logado
      update: {
        name,
        personality,
        enabled,
        updatedAt: new Date(),
      },
      create: {
        name,
        personality,
        enabled,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true, chatbotConfig });

  } catch (error: any) {
    console.error('Erro ao salvar configuração do chatbot:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor ao salvar configuração do chatbot.', details: error.message },
      { status: 500 }
    );
  }
}