import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Client } from "@/generated/prisma";

export const clientFormSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  cpf_cnpj: z.string().optional(),
});

export type ClientFormData = z.infer<typeof clientFormSchema>;

export function useClientForm(initialValues?: Client | null) {
  return useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: initialValues?.name || "",
      email: initialValues?.email || "",
      phone: initialValues?.phone || "",
      cpf_cnpj: initialValues?.cpf_cnpj || "",
    },
  });
}