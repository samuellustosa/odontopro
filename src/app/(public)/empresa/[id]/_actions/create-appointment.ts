// src/app/(public)/empresa/[id]/_actions/create-appointment.ts
"use server"

import prisma from '@/lib/prisma'
import { z } from 'zod'

const formSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório"),
  email: z.string().email("O email é obrigatório"),
  phone: z.string().min(1, "O telefone é obrigatório"),
  date: z.date(),
  serviceId: z.string().min(1, "O serviço é obrigatório"),
  time: z.string().min(1, "O horário é obrigatório"),
  empresaId: z.string().min(1, "O horário é obrigatório"),
})

type FormSchema = z.infer<typeof formSchema>

export async function createNewAppointment(formData: FormSchema) {

  const schema = formSchema.safeParse(formData)

  if (!schema.success) {
    return {
      error: schema.error.issues[0].message
    }
  }

  try {
    // 1. Procurar por um cliente existente com o mesmo e-mail para esta empresa
    let client = await prisma.client.findUnique({
      where: {
        email_userId: {
          email: formData.email,
          userId: formData.empresaId
        }
      }
    });

    // 2. Se o cliente não existir, criar um novo
    if (!client) {
      client = await prisma.client.create({
        data: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          userId: formData.empresaId,
        }
      });
    }

    // 3. Criar o agendamento e vinculá-lo ao cliente
    const selectedDate = new Date(formData.date)

    const year = selectedDate.getUTCFullYear();
    const month = selectedDate.getUTCMonth();
    const day = selectedDate.getUTCDate();

    // CORRIGIDO: Removido Date.UTC para salvar no fuso horário local
    const appointmentDate = new Date(Date.UTC(year, month, day, 0, 0, 0, 0))

    const newAppointment = await prisma.appointment.create({
      data: {
        time: formData.time,
        appointmentDate: appointmentDate,
        serviceId: formData.serviceId,
        userId: formData.empresaId,
        clientId: client.id,
      }
    })

    return {
      data: newAppointment
    }


  } catch (err) {
    console.log(err);
    return {
      error: "Erro ao cadastrar agendamento"
    }
  }
}