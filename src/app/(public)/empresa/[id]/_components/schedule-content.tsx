"use client"


import { useState, useCallback, useEffect } from 'react'
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
import { ScheduleTimeList } from './schedule-time-list'


type UserWithServiceAndSubscription = Prisma.UserGetPayload<{
    include: {
      services: true
      subscription: true
    }
  }>
  



interface ScheduleContentProps {
    empresa: UserWithServiceAndSubscription
}

export interface TimeSlot {
    time: string;
    available: boolean;
  }

export function ScheduleContent({ empresa }: ScheduleContentProps){

    const form = useAppointmentForm();
    const { watch } = form;

    const selectedDate = watch("date")
    const selectedServiceId = watch("serviceId")
  

    const [selectedTime, setSelectedTime] = useState("");
    const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

    // Quais os horários bloqueados 01/02/2025 > ["15:00", "18:00"]
    const [blockedTimes, setBlockedTimes] = useState<string[]>([])


    // Função que busca os horários bloqueados (via Fetch HTTP)
    const fetchBlockedTimes = useCallback(async (date: Date): Promise<string[]> => {
        setLoadingSlots(true);
        try {
            const dateString = date.toISOString().split("T")[0]
            const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/schedule/get-appointments?userId=${empresa.id}&date=${dateString}`)
            
            const json = await response.json();
            setLoadingSlots(false);
            return json; // Retornar o array com horarios que já tem bloqueado desse Dia e dessa empresa.


        } catch (err) {
            console.log(err)
            setLoadingSlots(false);
            return [];
        }
    }, [empresa.id])


    useEffect(() => {

        if (selectedDate) {
        fetchBlockedTimes(selectedDate).then((blocked) => {
            setBlockedTimes(blocked)
            const times = empresa.times || [];

            const finalSlots = times.map((time) => ({
                time: time,
                available: !blocked.includes(time)
            }))

            setAvailableTimeSlots(finalSlots)

        })
        }

    }, [selectedDate, empresa.times, fetchBlockedTimes, selectedTime])


    async function handleRegisterAppointment(formData: AppointmentFormData) {
        console.log(formData);
    }

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
                    onSubmit={form.handleSubmit(handleRegisterAppointment)}
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

                        {/* Horários disponíveis */}
                        {selectedServiceId && (
                            <div className="space-y-2">
                                <Label className="font-semibold">Horários disponíveis:</Label>
                                <div className="bg-gray-100 p-4 rounded-lg">
                                {loadingSlots ? (
                                    <p>Carregando horários...</p>
                                ) : availableTimeSlots.length === 0 ? (
                                    <p>Nenhum horário disponível</p>
                                ) : (
                                    <ScheduleTimeList
                                    onSelectTime={(time) => setSelectedTime(time)}
                                    empresaTimes={empresa.times}
                                    blockedTimes={blockedTimes}
                                    availableTimeSlots={availableTimeSlots}
                                    selectedTime={selectedTime}
                                    selectedDate={selectedDate}
                                    requiredSlots={
                                        empresa.services.find(
                                        (service) => service.id === selectedServiceId
                                        )
                                        ? Math.ceil(
                                            empresa.services.find(
                                                (service) => service.id === selectedServiceId
                                            )!.duration / 30
                                            )
                                        : 1
                                    }
                                    />
                                )}
                                </div>
                            </div>
                        )}

                        {empresa.status ? (
                            <Button
                                type="submit"
                                className="w-full bg-emerald-500 hover:bg-emerald-400"
                                disabled={!watch("name") || !watch("email") || !watch("phone") || !watch("date")}
                            >
                                Realizar agendamento
                            </Button>
                            ) : (
                            <p className="bg-red-500 text-white text-center px-4 py-2 rounded-md font-bold">
                                Estamos fechados no momento.
                            </p>
                            )}

                    </form>
                </Form>

            </section>
            

        </div>
    )
}