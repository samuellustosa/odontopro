"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';
import { getClients } from '../_data-access/get-clients';
import { useQuery } from '@tanstack/react-query';
import { ClientsList } from './clients-list';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { DialogClient } from './dialog-client';

export function ClientsContent({ userId }: { userId: string }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['clients', searchQuery],
    queryFn: async () => {
      const response = await getClients({ userId, query: searchQuery });
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
  });

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>Clientes</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className='w-4 h-4' />
              Adicionar Cliente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogClient
              closeModal={() => setIsDialogOpen(false)}
              refetchClients={refetch}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className='flex flex-row items-center space-x-2'>
          <div className='relative flex-1'>
            <Input
              placeholder='Buscar cliente...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='pl-10'
            />
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500' />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Carregando clientes...</p>
          ) : (
            <ClientsList clients={data || []} refetchClients={refetch} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}