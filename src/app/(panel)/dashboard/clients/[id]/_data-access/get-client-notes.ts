"use server"
import prisma from "@/lib/prisma"
import { auth } from '@/lib/auth'

export async function getClientNotes({ clientId }: { clientId: string }) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "Usuário não encontrado" };
    }
    
    try {
        const notes = await prisma.clientNote.findMany({
            where: {
                clientId: clientId,
                userId: session.user.id,
            },
            orderBy: {
                createdAt: 'desc',
            }
        });

        return { data: notes };
    } catch (err) {
        console.error(err);
        return { error: "Falha ao buscar notas" };
    }
}