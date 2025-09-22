// samuellustosa/odontopro/odontopro-0fcabb6a8bff4855fe3e59920aa68cf7e65051fe/src/app/(panel)/dashboard/clients/[id]/_actions/delete-client-note.ts
"use server"
import prisma from "@/lib/prisma"
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

const formSchema = z.object({
    noteId: z.string().min(1, "O ID da nota é obrigatório"),
    clientId: z.string().min(1, "O ID do cliente é obrigatório"),
});

type FormSchema = z.infer<typeof formSchema>;

export async function deleteClientNote(formData: FormSchema) { // Nome correto da função
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "Usuário não encontrado" };
    }

    const schema = formSchema.safeParse(formData);
    if (!schema.success) {
        return { error: schema.error.issues[0].message };
    }

    try {
        await prisma.clientNote.delete({
            where: {
                id: formData.noteId,
                userId: session.user.id,
                clientId: formData.clientId
            }
        });
        revalidatePath(`/dashboard/clients/${formData.clientId}`);
        return { data: "Nota excluída com sucesso!" };
    } catch (err) {
        console.error(err);
        return { error: "Falha ao excluir nota" };
    }
}