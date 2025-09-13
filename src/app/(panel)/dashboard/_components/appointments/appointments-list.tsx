"use client"

import { useRouter, useSearchParams } from 'next/navigation'
import {} from '@/components/ui/scroll-area'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Prisma } from '@/generated/prisma'


type AppointmentWithService = Prisma.AppointmentGetPayload<{
  include: {
    service: true,
  }
}>


interface AppointmentsListProps {
  times: string[]
}

export function AppointmentsList({ times }: AppointmentsListProps) {

  const searchParams = useSearchParams();
  const date = searchParams.get("date")

  const { data, isLoading } = useQuery({
    queryKey: ["get-appointments", date],
    queryFn: async () => {

      let activeDate = date;

      if (!activeDate) {
        const today = format(new Date(), "yyyy-MM-dd")
        activeDate = today;
      }


      const url = `${process.env.NEXT_PUBLIC_URL}/api/empresa/appointments?date=${activeDate}`

      const response = await fetch(url)

      const json = await response.json() as AppointmentWithService[];

      if (!response.ok) {
        return []
      }

      return json

    }
  })


    // Monta occupantMap slot > appointment
  // Se um Appointment começa no time (15:00) e tem requiredSlots 2
  // occupantMap["15:00", appoitment] occupantMap["15:30", appoitment] 
const occupantMap: Record<string, AppointmentWithService> = {}

  if (data && data.length > 0) {
    for (const appointment of data) {
      // Calcular quantos slots necessarios ocupa
      const requiredSlots = Math.ceil(appointment.service.duration / 30);

      // Descobrir qual é o indice do nosso array de horarios esse agendamento começa.
      const startIndex = times.indexOf(appointment.time)

      // Se encontrou o index
      if (startIndex !== -1) {

        for (let i = 0; i < requiredSlots; i++) {
          const slotIndex = startIndex + i;

          if (slotIndex < times.length) {
            occupantMap[times[slotIndex]] = appointment;
          }

        }

      }


    }
  }



  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-xl md:text-2x1 font-bold'>
            Agendamentos
        </CardTitle>

        <button>SELECIONAR DATA</button>  
      </CardHeader>

      <CardContent>
        <ScrollArea className='h-[calc(100vh-20rem)] lg:h[calc(100vh-15rem] pr-4'>
          
          {isLoading ? (
            <p>Carregando agenda...</p>
          ) : (
            times.map((slot) => {
              const occupant = occupantMap[slot]

              if (occupant) {
                return (
                  <div
                    key={slot}
                    className='flex items-center py-2 border-t last:border-b'
                  >
                    <div className='w-16 text-sm font-semibold'>{slot}</div>
                    <div className='flex-1 text-sm'>
                      <div className='font-semibold'>{occupant.name}</div>
                      <div className='text-sm text-gray-500'>
                        {occupant.phone}
                      </div>
                    </div>
                  </div>
                )
              }

              return (
                <div
                  key={slot}
                  className='flex items-center py-2 border-t last:border-b'
                >
                  <div className='w-16 text-sm font-semibold'>{slot}</div>
                  <div className='flex-1 text-sm'>
                    Disponível
                  </div>
                </div>
              )
            })
          )}

        </ScrollArea>
      </CardContent>
    </Card>
  )
}