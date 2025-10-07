import prisma from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { ConnectionStatus } from "@/generated/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "ID do usuário não fornecido." }, { status: 400 });
  }

  try {
    const config = await prisma.chatbotConfig.findUnique({
      where: { userId },
    });

    if (config) {
      return NextResponse.json({
        qrCodeUrl: config.qrCodeUrl,
        status: config.connectionStatus,
        config,
      });
    } else {
      return NextResponse.json({
        qrCodeUrl: null,
        status: ConnectionStatus.DISCONNECTED,
        config: null,
      });
    }
  } catch (err) {
    console.error("Erro ao buscar QR Code:", err);
    return NextResponse.json({ error: "Falha ao buscar QR Code." }, { status: 500 });
  }
}
