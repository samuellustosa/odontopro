"use client";

import { useQueryClient } from '@tanstack/react-query';
import { Client } from "@/generated/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash } from "lucide-react";
import { toast } from 'sonner';
import { deleteClient } from '../_actions/client-actions';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { DialogClient } from './dialog-client';
import { useState } from 'react';
import { formatPhone } from '@/utils/formatPhone';

interface ClientsListProps {
  clients: Client[];
  refetchClients: () => void;
}

export function ClientsList({ clients, refetchClients }: ClientsListProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  async function handleDelete(clientId: string) {
    const response = await deleteClient(clientId);
    if (response.error) {
      toast.error(response.error);
      return;
    }
    toast.success(response.data);
    refetchClients();
  }

  function handleEdit(client: Client) {
    setEditingClient(client);
    setIsDialogOpen(true);
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <div className="space-y-4">
        {clients.length === 0 ? (
          <p>Nenhum cliente encontrado.</p>
        ) : (
          clients.map((client) => (
            <Card key={client.id} className='p-4'>
              <CardContent className='p-0 flex items-center justify-between'>
                <div>
                  <h3 className='font-semibold'>{client.name}</h3>
                  <p className='text-sm text-gray-500'>{client.email}</p>
                  <p className='text-sm text-gray-500'>{formatPhone(client.phone || '')}</p>
                </div>
                <div className='flex space-x-2'>
                  <DialogTrigger asChild>
                    <Button variant='ghost' size='icon' onClick={() => handleEdit(client)}>
                      <Pencil className='w-4 h-4' />
                    </Button>
                  </DialogTrigger>
                  <Button variant='ghost' size='icon' onClick={() => handleDelete(client.id)}>
                    <Trash className='w-4 h-4' />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      <DialogContent>
        <DialogClient
          closeModal={() => {
            setIsDialogOpen(false);
            setEditingClient(null);
          }}
          refetchClients={refetchClients}
          initialValues={editingClient}
        />
      </DialogContent>
    </Dialog>
  );
}