// src/app/api/whatsapp/get-qrcode/route.ts
import prisma from "@/lib/prisma";
import { NextResponse, NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl;
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: "ID do usuário não fornecido." }, { status: 400 });
    }

    try {
        const config = await prisma.chatbotConfig.findUnique({
            where: { userId: userId },
            select: { qrCodeUrl: true },
        });

        if (config?.qrCodeUrl) {
            return NextResponse.json({ qrCodeUrl: config.qrCodeUrl });
        } else {
            return NextResponse.json({ qrCodeUrl: null });
        }
    } catch (err) {
        console.error("Erro ao buscar QR Code:", err);
        return NextResponse.json({ error: "Falha ao buscar QR Code." }, { status: 500 });
    }
}