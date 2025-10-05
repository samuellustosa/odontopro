"use server";

import prisma from "@/lib/prisma";

export async function getChatbotConfig({ userId }: { userId: string }) {
  try {
    if (!userId) {
      return null;
    }

    const config = await prisma.chatbotConfig.findUnique({
      where: {
        userId,
      },
    });

    return config;
  } catch (err) {
    console.error(err);
    return null;
  }
}