// src/app/api/chatbot/load-config/route.ts
import { NextRequest, NextResponse } from 'next/server';
import getSession from '@/lib/getSession';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) { // Usamos POST para consistência
  try {
    const session = await getSession();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    const chatbotConfig = await prisma.chatbotConfig.findUnique({
      where: { userId: session.user.id },
    });

    if (chatbotConfig) {
      return NextResponse.json({ success: true, chatbotConfig });
    } else {
      // Retorna uma configuração padrão se nenhuma for encontrada
      return NextResponse.json({
        success: true,
        chatbotConfig: {
          name: "Assistente Virtual",
          personality: "Gentil, amigavel, educado, profissional",
          enabled: true,
          // IDs e datas serão adicionados pelo DB ao criar, não necessário aqui
        }
      });
    }

  } catch (error: any) {
    console.error('Erro ao carregar configuração do chatbot:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor ao carregar configuração do chatbot.', details: error.message },
      { status: 500 }
    );
  }
}