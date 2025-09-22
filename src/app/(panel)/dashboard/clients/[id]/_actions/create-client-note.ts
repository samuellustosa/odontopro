"use server"
import prisma from "@/lib/prisma"
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

const formSchema = z.object({
    clientId: z.string().min(1, "O ID do cliente é obrigatório"),
    content: z.string().min(1, "A nota não pode ser vazia"),
});

type FormSchema = z.infer<typeof formSchema>;

export async function createClientNote(formData: FormSchema) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "Usuário não encontrado" };
    }

    const schema = formSchema.safeParse(formData);
    if (!schema.success) {
        return { error: schema.error.issues[0].message };
    }

    try {
        await prisma.clientNote.create({
            data: {
                clientId: formData.clientId,
                userId: session.user.id,
                content: formData.content,
            }
        });
        revalidatePath(`/dashboard/clients/${formData.clientId}`);
        return { data: "Nota adicionada com sucesso!" };
    } catch (err) {
        console.error(err);
        return { error: "Falha ao adicionar nota" };
    }
}