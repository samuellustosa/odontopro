"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(1, "O nome do bot é obrigatório"),
  personality: z.string().min(1, "A personalidade é obrigatória"),
  enabled: z.boolean(),
});

type FormSchema = z.infer<typeof formSchema>;

export async function updateChatbotConfig(formData: FormSchema) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      error: "Usuário não encontrado!",
    };
  }

  const schema = formSchema.safeParse(formData);

  if (!schema.success) {
    return {
      error: "Preencha todos os campos corretamente",
    };
  }

  try {
    await prisma.chatbotConfig.upsert({
      where: { userId: session.user.id },
      update: {
        name: formData.name,
        personality: formData.personality,
        enabled: formData.enabled,
      },
      create: {
        name: formData.name,
        personality: formData.personality,
        enabled: formData.enabled,
        userId: session.user.id,
      },
    });

    revalidatePath("/dashboard/chatbot");

    return {
      data: "Configurações do chatbot salvas com sucesso!",
    };
  } catch (err) {
    console.error(err);
    return {
      error: "Falha ao atualizar configurações do chatbot",
    };
  }
}