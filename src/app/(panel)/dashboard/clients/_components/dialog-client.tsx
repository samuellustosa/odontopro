"use client";

import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { createClient, updateClient } from '../_actions/client-actions';
import { ClientFormData, useClientForm } from './dialog-client-form';
import { Client } from '@/generated/prisma';

interface DialogClientProps {
  closeModal: () => void;
  refetchClients: () => void;
  initialValues?: Client | null;
}

export function DialogClient({ closeModal, refetchClients, initialValues }: DialogClientProps) {
  const form = useClientForm(initialValues || undefined);

  async function onSubmit(formData: ClientFormData) {
    if (initialValues) {
      const response = await updateClient(initialValues.id, formData);
      if (response.error) {
        toast.error(response.error);
        return;
      }
      toast.success(response.data);
    } else {
      const response = await createClient(formData);
      if (response.error) {
        toast.error(response.error);
        return;
      }
      toast.success(response.data);
    }
    
    refetchClients();
    closeModal();
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{initialValues ? 'Editar Cliente' : 'Adicionar Cliente'}</DialogTitle>
        <DialogDescription>
          {initialValues ? 'Edite os dados do cliente.' : 'Adicione um novo cliente para gerenciar.'}
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Nome completo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="email@exemplo.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <Input placeholder="(99) 99999-9999" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cpf_cnpj"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CPF/CNPJ</FormLabel>
                <FormControl>
                  <Input placeholder="CPF ou CNPJ" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full">
            {initialValues ? 'Salvar Alterações' : 'Adicionar Cliente'}
          </Button>
        </form>
      </Form>
    </>
  );
}