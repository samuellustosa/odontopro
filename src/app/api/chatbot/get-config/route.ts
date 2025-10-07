// src/app/api/chatbot/get-config/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { getChatbotConfig } from '@/app/(panel)/dashboard/chatbot/_data-access/get-config';

export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl;
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: "ID do usuário não fornecido." }, { status: 400 });
    }

    const config = await getChatbotConfig({ userId });

    if (!config) {
        return NextResponse.json({ error: "Configuração não encontrada." }, { status: 404 });
    }

    return NextResponse.json(config);
}