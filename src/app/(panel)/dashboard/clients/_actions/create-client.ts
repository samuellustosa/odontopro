"use server"
import prisma from "@/lib/prisma"
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

const formSchema = z.object({
    name: z.string().min(1, "O nome é obrigatório"),
    email: z.string().email("O e-mail é obrigatório"),
    phone: z.string().min(1, "O telefone é obrigatório"),
});

type FormSchema = z.infer<typeof formSchema>;

export async function createNewClient(formData: FormSchema) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "Usuário não encontrado" };
    }

    const schema = formSchema.safeParse(formData);
    if (!schema.success) {
        return { error: schema.error.issues[0].message };
    }

    try {
        await prisma.client.create({
            data: {
                ...formData,
                userId: session.user.id
            }
        });
        revalidatePath("/dashboard/clients");
        return { data: "Cliente criado com sucesso" };
    } catch (err) {
        console.error(err);
        return { error: "Falha ao criar cliente" };
    }
}