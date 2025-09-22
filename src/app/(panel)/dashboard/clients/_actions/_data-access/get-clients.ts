// Exemplo de get-clients.ts
"use server"
import prisma from "@/lib/prisma"

export async function getClients({ userId, query }: { userId: string, query?: string }) {
  try {
    const clients = await prisma.client.findMany({
      where: {
        userId: userId,
        // Adicionar lógica de busca aqui
        OR: query ? [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query, mode: 'insensitive' } },
          { cpf_cnpj: { contains: query, mode: 'insensitive' } },
        ] : undefined,
      },
      orderBy: {
        name: 'asc'
      }
    })
    return { data: clients }
  } catch (err) {
    return { error: "Falha ao buscar clientes" }
  }
}