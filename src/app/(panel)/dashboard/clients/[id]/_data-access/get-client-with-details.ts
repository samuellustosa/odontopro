"use server"

import prisma from "@/lib/prisma"
import { auth } from '@/lib/auth'

export async function getClientWithDetails({ clientId }: { clientId: string }) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "Usuário não encontrado" };
    }

    try {
        const client = await prisma.client.findFirst({
            where: {
                id: clientId,
                userId: session.user.id
            },
            include: {
                appointments: {
                    include: {
                        service: true
                    },
                    orderBy: {
                        appointmentDate: 'desc'
                    }
                },
            }
        });

        if (!client) {
            return { error: "Cliente não encontrado" };
        }

        return { data: client };
    } catch (err) {
        console.error(err);
        return { error: "Falha ao buscar cliente" };
    }
}