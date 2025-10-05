// src/app/(panel)/dashboard/chatbot/_components/chatbot-content.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useChatbotForm, ChatbotFormData } from "./chatbot-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { updateChatbotConfig } from "../_data-access/update-config";
import { toast } from "sonner";
import { ChatbotConfig } from "@/generated/prisma";
import { ResultPermissionProp } from "@/utils/permissions/canPermission";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import { useState } from "react";
import { QrCode } from "lucide-react";

interface ChatbotContentProps {
  userId: string;
  config: ChatbotConfig | null;
  permission: ResultPermissionProp;
}

export function ChatbotContent({ userId, config, permission }: ChatbotContentProps) {
  const form = useChatbotForm({
    initialValues: config || undefined,
  });

  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  async function onSubmit(values: ChatbotFormData) {
    const response = await updateChatbotConfig({
      ...values,
      enabled: values.enabled,
    });
    if (response.error) {
      toast.error(response.error);
    } else {
      toast.success(response.data);
    }
  }

  async function handleGenerateQrCode() {
    try {
      toast.info("Gerando QR Code...");
      const response = await fetch('/api/whatsapp/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (response.ok && data.qrCodeUrl) {
        setQrCodeUrl(data.qrCodeUrl);
        toast.success("QR Code gerado com sucesso!");
      } else {
        toast.error(data.error || "Falha ao gerar QR Code.");
      }

    } catch (err) {
      toast.error("Erro na comunicação com a API.");
    }
  }

  if (!permission.hasPermission) {
    return null;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Card className="p-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Configurações do Chatbot</CardTitle>
          <CardDescription>
            Personalize o seu assistente virtual para atender os clientes via WhatsApp.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="enabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Ativar Chatbot</FormLabel>
                      <FormDescription>
                        Ative ou desative seu assistente virtual.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Bot</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Assistente Virtual OdontoPRO" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="personality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Personalidade do Bot</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Ex: Gentil, amigável, educado e profissional" className="max-h-52" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Salvar Alterações
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="p-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Conectar WhatsApp</CardTitle>
          <CardDescription>
            Conecte seu número de WhatsApp para que o bot possa começar a interagir com seus clientes.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4">
          <Button onClick={handleGenerateQrCode} disabled={!config?.enabled}>
            <QrCode className="w-4 h-4 mr-2" />
            Gerar QR Code de Conexão
          </Button>
          {qrCodeUrl && (
            <div className="border p-4 rounded-md">
              <Image src={qrCodeUrl} alt="QR Code" width={256} height={256} />
              <p className="mt-2 text-center text-sm text-gray-500">Escaneie com seu WhatsApp</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}