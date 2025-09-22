"use server"

import prisma from "@/lib/prisma"
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'

const clientSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  cpf_cnpj: z.string().optional(),
})

type ClientFormData = z.infer<typeof clientSchema>

export async function createClient(formData: ClientFormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Usuário não autenticado" };
  }

  const validatedData = clientSchema.safeParse(formData);
  if (!validatedData.success) {
    return { error: validatedData.error.issues[0].message };
  }

  try {
    await prisma.client.create({
      data: {
        ...validatedData.data,
        userId: session.user.id
      }
    });
    revalidatePath("/dashboard/clients");
    return { data: "Cliente cadastrado com sucesso!" };
  } catch (err) {
    return { error: "Erro ao cadastrar cliente." };
  }
}

export async function updateClient(clientId: string, formData: ClientFormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Usuário não autenticado" };
  }
  
  const validatedData = clientSchema.safeParse(formData);
  if (!validatedData.success) {
    return { error: validatedData.error.issues[0].message };
  }

  try {
    await prisma.client.update({
      where: { id: clientId, userId: session.user.id },
      data: validatedData.data
    });
    revalidatePath("/dashboard/clients");
    return { data: "Cliente atualizado com sucesso!" };
  } catch (err) {
    return { error: "Erro ao atualizar cliente." };
  }
}

export async function deleteClient(clientId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Usuário não autenticado" };
  }

  try {
    await prisma.client.delete({
      where: { id: clientId, userId: session.user.id }
    });
    revalidatePath("/dashboard/clients");
    return { data: "Cliente excluído com sucesso!" };
  } catch (err) {
    return { error: "Erro ao excluir cliente." };
  }
}