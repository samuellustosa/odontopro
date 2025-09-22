"use server"
import prisma from "@/lib/prisma"
import { auth } from '@/lib/auth'

export async function getAllClients({ userId, query }: { userId: string, query?: string }) {
    if (!userId) {
        return { error: "Usuário não encontrado" };
    }

    try {
        const clients = await prisma.client.findMany({
            where: {
                userId: userId,
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { email: { contains: query, mode: 'insensitive' } },
                    { phone: { contains: query, mode: 'insensitive' } },
                ],
            },
            orderBy: {
                name: 'asc'
            }
        });

        return { data: clients };
    } catch (err) {
        console.error(err);
        return { error: "Falha ao buscar clientes" };
    }
}