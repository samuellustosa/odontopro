"use client"
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus, Pencil, X, Search } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Client } from '@/generated/prisma'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getAllClients } from '../_data-access/get-all-clients'
import { DialogClient } from './dialog-client'
import { ScrollArea } from '@/components/ui/scroll-area'

interface ClientsContentProps {
  userId: string;
}

export function ClientsContent({ userId }: ClientsContentProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: clients, isLoading, refetch } = useQuery({
    queryKey: ["clients", userId],
    queryFn: async () => {
      const allClients = await getAllClients({ userId, query: searchQuery });
      return allClients.data || [];
    },
    staleTime: 60000,
  });

  async function handleDeleteClient(clientId: string) {
    // Implemente a lógica de exclusão aqui.
    // Lembre-se de criar a Server Action para isso.
    toast.success("Cliente excluído com sucesso (Esta função ainda precisa ser implementada).");
    queryClient.invalidateQueries({ queryKey: ["clients", userId] });
    await refetch();
  }

  function handleEditClient(client: Client) {
    setEditingClient(client);
    setIsDialogOpen(true);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    refetch();
  }

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          setEditingClient(null);
        }
      }}
    >
      <section className='mx-auto max-w-4xl w-full'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-xl md:text-2xl font-bold'>Clientes</CardTitle>
            <DialogTrigger asChild>
              <Button>
                <Plus className='w-4 h-4' />
              </Button>
            </DialogTrigger>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSearch} className="relative mb-4">
              <Input
                placeholder="Buscar por nome, e-mail ou telefone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
              <Button type="submit" variant="ghost" size="icon" className="absolute right-0 top-0">
                <Search className="w-4 h-4" />
              </Button>
            </form>

            <ScrollArea className='h-[calc(100vh-25rem)] lg:h-[calc(100vh-20rem)] pr-4'>
              {isLoading ? (
                <p>Carregando clientes...</p>
              ) : clients && clients.length > 0 ? (
                clients.map((client) => (
                  <article key={client.id} className='flex items-center justify-between py-2 border-t last:border-b'>
                    <div className='flex-1 text-sm'>
                      <div className='font-semibold'>{client.name}</div>
                      <div className='text-sm text-gray-500'>{client.email}</div>
                      <div className='text-sm text-gray-500'>{client.phone}</div>
                    </div>
                    <div className='ml-auto flex items-center gap-2'>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClient(client)}
                      >
                        <Pencil className='w-4 h-4' />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClient(client.id)}
                      >
                        <X className='w-4 h-4' />
                      </Button>
                    </div>
                  </article>
                ))
              ) : (
                <p className="text-center text-gray-500">Nenhum cliente encontrado.</p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </section>

      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{editingClient ? "Editar Cliente" : "Adicionar Novo Cliente"}</DialogTitle>
          <DialogDescription>
            {editingClient ? "Edite os dados do cliente." : "Adicione manualmente um novo cliente."}
          </DialogDescription>
        </DialogHeader>
        <DialogClient
          closeModal={() => setIsDialogOpen(false)}
          initialValues={editingClient || undefined}
        />
      </DialogContent>
    </Dialog>
  );
}