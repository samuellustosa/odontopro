"use client"

import { Client, Appointment, Service } from '@/generated/prisma';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Phone, Mail, Link as LinkIcon, NotebookPen, NotebookText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatPhone } from '@/utils/formatPhone';
import { format } from 'date-fns';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ClientNotes } from './client-notes';
import { useEffect } from 'react';

interface ClientWithDetails extends Client {
    appointments: (Appointment & {
        service: Service;
    })[];
}

interface ClientContentProps {
    client: ClientWithDetails;
    userId: string;
}

export function ClientContent({ client, userId }: ClientContentProps) {
    const router = useRouter();
    const queryClient = useQueryClient();

    const handleBack = () => {
        router.push('/dashboard/clients');
    };

    const handleCall = () => {
        window.location.href = `tel:${client.phone}`;
    };

    const handleEmail = () => {
        window.location.href = `mailto:${client.email}`;
    };

    const handleWhatsApp = () => {
        const cleanedPhone = client.phone.replace(/\D/g, '');
        window.open(`https://wa.me/55${cleanedPhone}`, '_blank');
    };

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <Button variant="ghost" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para clientes
            </Button>

            <Card className="p-6">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-3xl font-bold">{client.name}</CardTitle>
                        <div className="flex space-x-2">
                            <Button size="icon" onClick={handleCall}>
                                <Phone className="w-4 h-4" />
                            </Button>
                            <Button size="icon" onClick={handleEmail}>
                                <Mail className="w-4 h-4" />
                            </Button>
                            <Button size="icon" onClick={handleWhatsApp}>
                                <LinkIcon className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="mt-4">
                    <p className="text-gray-600">**Email:** {client.email}</p>
                    <p className="text-gray-600">**Telefone:** {formatPhone(client.phone)}</p>
                    <p className="text-gray-600">**Cliente desde:** {format(new Date(client.createdAt), 'dd/MM/yyyy')}</p>
                </CardContent>
            </Card>

            <Card className="p-6">
                <CardHeader>
                    <CardTitle className="text-2xl">Histórico de Agendamentos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {client.appointments.length > 0 ? (
                        client.appointments.map(appointment => (
                            <div key={appointment.id} className="border-b pb-2 last:border-b-0">
                                <p className="font-semibold">{appointment.service.name}</p>
                                <p className="text-sm text-gray-500">
                                    {format(new Date(appointment.appointmentDate), 'dd/MM/yyyy')} às {appointment.time}
                                </p>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500">Nenhum agendamento encontrado.</p>
                    )}
                </CardContent>
            </Card>

            <ClientNotes clientId={client.id} userId={userId} />

        </div>
    );
}