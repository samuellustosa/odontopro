"use client"
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Client } from '@/generated/prisma'
import { createNewClient } from '../_actions/create-client'
import { updateClient } from '../_actions/update-client'
import { formatPhone } from '@/utils/formatPhone'

const clientSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório"),
  email: z.string().email("O e-mail é obrigatório"),
  phone: z.string().min(1, "O telefone é obrigatório"),
});

export type ClientFormData = z.infer<typeof clientSchema>;

interface DialogClientProps {
  closeModal: () => void;
  initialValues?: Client;
}

export function DialogClient({ closeModal, initialValues }: DialogClientProps) {
  const router = useRouter();

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: initialValues?.name || "",
      email: initialValues?.email || "",
      phone: initialValues?.phone || "",
    },
  });

  async function onSubmit(values: ClientFormData) {
    if (initialValues?.id) {
      const response = await updateClient({ ...values, id: initialValues.id });
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success("Cliente atualizado com sucesso!");
        router.refresh();
        closeModal();
      }
    } else {
      const response = await createNewClient(values);
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success("Cliente adicionado com sucesso!");
        router.refresh();
        closeModal();
      }
    }
  }

  return (
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
                <Input
                  placeholder="(XX) XXXXX-XXXX"
                  {...field}
                  onChange={(e) => {
                    const formattedValue = formatPhone(e.target.value);
                    field.onChange(formattedValue);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          {initialValues ? "Salvar alterações" : "Adicionar cliente"}
        </Button>
      </form>
    </Form>
  );
}