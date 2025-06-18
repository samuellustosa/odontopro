"use client"

import Image from "next/image"
import imgTeste from "../../../../../../public/foto1.png"
import { MapPin } from "lucide-react"
import { Prisma } from "@/generated/prisma"
import { useAppointmentForm, AppointmentFormData } from './schedule-form'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormLabel, FormMessage, FormItem } from '@/components/ui/form'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { formatPhone } from '@/utils/formatPhone'
import { DateTimePicker } from './date-picker'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'



type UserWithServiceAndSubscription = Prisma.UserGetPayload<{
    include: {
      services: true
      subscription: true
    }
  }>
  



interface ScheduleContentProps {
    empresa: UserWithServiceAndSubscription
}

export function ScheduleContent({ empresa }: ScheduleContentProps){

    const form = useAppointmentForm();

    return(
        <div className="min-h-screen flex flex-col">
            <div className="h-32 bg-emerald-500"/>

            <section className="container mx-auto px-4 -mt-16">
                <div className="max-w-2xl mx-auto">
                    <article className="flex flex-col items-center">
                            <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-white mb-8">
                                <Image 
                                    src={empresa.image ? empresa.image : imgTeste}
                                    alt="Foto da empresa"
                                    className="object-cover"
                                    fill
                                    unoptimized={Boolean(empresa.image && empresa.image.startsWith('http'))}
                                />
                            </div>
                            <h1 className="text-2xl font-semibold mb-2">
                                {empresa.name}
                            </h1>
                            <div className="flex items-center gap-1">
                                <MapPin className="w-5 h-5"/>
                                <span>
                                    {empresa.address ? empresa.address : "Endereço não informado"}
                                </span>
                            </div>
                    </article>
                </div>
            </section>

            <section className="max-w-2xl mx-auto w-full mt-6">
                {/* Formulário de agendamento */}
                <Form {...form}>
                    <form
                    className="mx-2 space-y-6 bg-white p-6 border rounded-md shadow-sm"
                    >

                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                        <FormItem className="my-2">
                            <FormLabel className="font-semibold">Nome completo:</FormLabel>
                            <FormControl>
                            <Input
                                id="name"
                                placeholder="Digite seu nome completo..."
                                {...field}
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem className="my-2">
                            <FormLabel className="font-semibold">Email:</FormLabel>
                            <FormControl>
                                <Input
                                id="email"
                                placeholder="Digite seu email..."
                                {...field}
                                />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />

                        <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem className="my-2">
                            <FormLabel className="font-semibold">Telefone:</FormLabel>
                            <FormControl>
                                <Input
                                {...field}
                                id="phone"
                                placeholder="(XX) XXXXX-XXXX"
                                onChange={(e) => {
                                    const formattedValue = formatPhone(e.target.value)
                                    field.onChange(formattedValue)
                                }}
                                />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />

                        <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem className="flex items-center gap-2 space-y-1">
                            <FormLabel className="font-semibold">Data do agendamento:</FormLabel>
                            <FormControl>
                                <DateTimePicker
                                initialDate={new Date()}
                                className="w-full rounded border p-2"
                                onChange={(date) => {
                                    if (date) {
                                    field.onChange(date)
                                    }
                                }}
                                />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />

                        <FormField
                        control={form.control}
                        name="serviceId"
                        render={({ field }) => (
                            <FormItem className="">
                            <FormLabel className="font-semibold">Selecione o serviço:</FormLabel>
                            <FormControl>
                                <Select onValueChange={field.onChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione um serviço"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {empresa.services.map((service) => (
                                            <SelectItem key={service.id} value={service.id}>
                                                    {service.name} - ( {Math.floor(service.duration / 60)}h {service.duration % 60}min )
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />

                    </form>
                </Form>

            </section>
            

        </div>
    )
}