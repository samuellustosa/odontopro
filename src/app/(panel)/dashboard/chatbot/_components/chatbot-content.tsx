// samuellustosa/odontopro/odontopro-e6e4f7d9d3adfc3f329b72bde2fd08fe3ae63e48/src/app/(panel)/dashboard/chatbot/_components/chatbot-content.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useChatbotForm, ChatbotFormData } from "./chatbot-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { updateChatbotConfig } from "../_data-access/update-config";
import { toast } from "sonner";
import { ChatbotConfig, ConnectionStatus } from "@/generated/prisma";
import { ResultPermissionProp } from "@/utils/permissions/canPermission";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import { useState } from "react";
import { QrCode, Loader2, CheckCircle2, CircleOff, Signal } from "lucide-react"; // Novos ícones
import { useRouter } from 'next/navigation';
import { cn } from "@/lib/utils";

interface ChatbotContentProps {
  userId: string;
  config: ChatbotConfig | null;
  permission: ResultPermissionProp;
}

const statusText: Record<ConnectionStatus, string> = {
    CONNECTED: "Conectado",
    DISCONNECTED: "Desconectado",
    PENDING: "Aguardando leitura do QR Code"
};

const statusColor: Record<ConnectionStatus, string> = {
    CONNECTED: "text-green-500",
    DISCONNECTED: "text-red-500",
    PENDING: "text-yellow-500"
};

export function ChatbotContent({ userId, config, permission }: ChatbotContentProps) {
  const form = useChatbotForm({
    initialValues: config || undefined,
  });
  const router = useRouter();

  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(config?.qrCodeUrl || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

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

  const pollForQrCode = async (instanceUserId: string) => {
    const response = await fetch(`/api/whatsapp/get-qrcode?userId=${instanceUserId}`);
    const data = await response.json();
    if (data.qrCodeUrl) {
      setQrCodeUrl(data.qrCodeUrl);
      setStatusMessage(null);
      toast.success("QR Code recebido!");
      setIsGenerating(false);
      return data.qrCodeUrl;
    }
    return null;
  };

  async function handleGenerateQrCode() {
    setIsGenerating(true);
    setQrCodeUrl(null);
    setStatusMessage("Enviando solicitação para criar instância...");

    try {
      const response = await fetch('/api/whatsapp/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
        setStatusMessage(`Erro: ${data.error}`);
        setIsGenerating(false);
      } else {
        if (data.qrCodeUrl) {
          setQrCodeUrl(data.qrCodeUrl);
          setStatusMessage("QR Code gerado com sucesso! Escaneie para conectar.");
          setIsGenerating(false);
        } else {
          setStatusMessage("Instância criada. Aguardando QR Code via webhook.");
          // Iniciar o polling apenas se o QR code não foi recebido na resposta inicial
          const intervalId = setInterval(async () => {
            const qrCode = await pollForQrCode(userId);
            if (qrCode) {
              clearInterval(intervalId);
            }
          }, 3000); 
        }
      }

    } catch (err) {
      toast.error("Erro na comunicação com o servidor.");
      setStatusMessage("Falha de conexão com o servidor.");
      setIsGenerating(false);
    }
  }

  if (!permission.hasPermission) {
    return null;
  }

  const isConnected = config?.connectionStatus === "CONNECTED";

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
          <CardTitle className="text-2xl font-bold">Conectar WhatsApp Business</CardTitle>
          <CardDescription>
            Conecte seu número de WhatsApp para que o bot possa começar a interagir com seus clientes.
          </CardDescription>
          <div className="flex items-center gap-2 mt-2">
              <Signal className={cn("size-5", statusColor[config?.connectionStatus || "DISCONNECTED"])} />
              <p className={cn("font-medium", statusColor[config?.connectionStatus || "DISCONNECTED"])}>
                  Status: {statusText[config?.connectionStatus || "DISCONNECTED"]}
              </p>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4">
            {!isConnected && (
                <Button onClick={handleGenerateQrCode} disabled={!config?.enabled || isGenerating}>
                    {isGenerating ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <QrCode className="w-4 h-4 mr-2" />
                    )}
                    {isGenerating ? "Gerando..." : "Gerar QR Code de Conexão"}
                </Button>
            )}

            {config?.connectionStatus === "PENDING" && config?.qrCodeUrl && (
                <div className="border p-4 rounded-md flex flex-col items-center justify-center min-h-[300px] w-[300px] text-center">
                    {statusMessage && (
                        <p className="text-sm text-gray-600 font-semibold">{statusMessage}</p>
                    )}
                    <Image src={config.qrCodeUrl} alt="QR Code" width={256} height={256} />
                    <p className="mt-2 text-sm text-gray-500">Escaneie com seu WhatsApp Business</p>
                </div>
            )}

            {isConnected && (
                <div className={cn("border border-green-500 bg-green-100 p-4 rounded-md text-center animate-fade-in")}>
                    <CheckCircle2 className="size-8 text-green-500 mx-auto mb-2" />
                    <p className="text-lg font-semibold text-green-700">Chatbot Conectado!</p>
                    <p className="text-sm text-green-600">Seu assistente virtual está online e pronto para uso.</p>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}