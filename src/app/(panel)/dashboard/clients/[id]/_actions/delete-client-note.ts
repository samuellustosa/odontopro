// samuellustosa/odontopro/odontopro-0fcabb6a8bff4855fe3e59920aa68cf7e65051fe/src/app/(panel)/dashboard/clients/_actions/delete-client.ts
"use server"
import prisma from "@/lib/prisma"
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

const formSchema = z.object({
    id: z.string().min(1, "O ID do cliente é obrigatório"),
});

type FormSchema = z.infer<typeof formSchema>;

export async function deleteClient(formData: FormSchema) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "Usuário não encontrado" };
    }

    const schema = formSchema.safeParse(formData);
    if (!schema.success) {
        return { error: schema.error.issues[0].message };
    }

    try {
        await prisma.client.delete({
            where: { id: formData.id, userId: session.user.id },
        });

        revalidatePath("/dashboard/clients");
        return { data: "Cliente excluído com sucesso" };
    } catch (err) {
        console.error(err);
        return { error: "Falha ao excluir cliente" };
    }
}