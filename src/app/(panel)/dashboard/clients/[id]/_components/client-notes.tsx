"use client";

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getClientNotes } from '../_data-access/get-client-notes';
import { createClientNote } from '../_actions/create-client-note';
import { toast } from 'sonner';
import { NotebookPen, NotebookText } from 'lucide-react';
import { format } from 'date-fns';

const noteSchema = z.object({
  content: z.string().min(1, "A nota não pode ser vazia"),
});

type NoteFormData = z.infer<typeof noteSchema>;

interface ClientNotesProps {
  clientId: string;
  userId: string;
}

export function ClientNotes({ clientId, userId }: ClientNotesProps) {
  const queryClient = useQueryClient();
  const form = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      content: "",
    },
  });

  const { data: notes, isLoading } = useQuery({
    queryKey: ["client-notes", clientId],
    queryFn: async () => {
      const result = await getClientNotes({ clientId });
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });

  const createNoteMutation = useMutation({
    mutationFn: (newNote: NoteFormData) => createClientNote({ ...newNote, clientId }),
    onSuccess: (data) => {
      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success(data.data);
        form.reset();
        queryClient.invalidateQueries({ queryKey: ["client-notes", clientId] });
      }
    },
    onError: () => {
      toast.error("Falha ao adicionar nota.");
    },
  });

  async function onSubmit(values: NoteFormData) {
    createNoteMutation.mutate(values);
  }

  return (
    <Card className="p-6">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <NotebookPen className='w-6 h-6'/>
          Anotações
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea placeholder="Adicionar uma nova nota..." className="max-h-52" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Salvando..." : "Adicionar nota"}
            </Button>
          </form>
        </Form>
        <div className="space-y-2 mt-4">
          {isLoading ? (
            <p>Carregando notas...</p>
          ) : notes && notes.length > 0 ? (
            notes.map((note) => (
              <div key={note.id} className="bg-gray-100 p-3 rounded-md text-sm">
                <p>{note.content}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Adicionado em: {format(new Date(note.createdAt), 'dd/MM/yyyy')}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">Nenhuma anotação para este cliente.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}