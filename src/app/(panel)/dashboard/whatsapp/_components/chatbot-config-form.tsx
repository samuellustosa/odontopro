'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Loader2, Zap } from 'lucide-react';


interface ChatbotConfig {
  name: string;
  personality: string;
  enabled: boolean;
}

interface ChatbotConfigFormProps {
  userId: string;
}

export function ChatbotConfigForm({ userId }: ChatbotConfigFormProps) {
  const [config, setConfig] = useState<ChatbotConfig>({
    name: "Assistente Virtual",
    personality: "Gentil, amigavel, educado, profissional",
    enabled: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadConfig = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/chatbot/load-config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });
        const data = await response.json();

        if (data.success && data.chatbotConfig) {
          setConfig(data.chatbotConfig);
          toast.success('Configurações do chatbot carregadas.');
        } else {
          toast.info('Nenhuma configuração de chatbot encontrada, usando padrões.');
        }
      } catch (error) {
        console.error('Erro ao carregar configurações do chatbot:', error);
        toast.error('Erro ao carregar configurações do chatbot.');
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      loadConfig();
    }
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/chatbot/save-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await response.json();

      if (data.success) {
        toast.success('Configurações do chatbot salvas com sucesso!');
      } else {
        throw new Error(data.error || 'Erro ao salvar configurações.');
      }
    } catch (error) {
      console.error('Erro ao salvar configurações do chatbot:', error);
      toast.error('Erro ao salvar configurações do chatbot. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-xl mx-auto">
        <CardHeader>
          <CardTitle></CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col justify-center items-center h-40">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        </CardContent>
      </Card>
    );
  }

  return (

    <Card className=" max-w-xl mx-auto w-220">
      <CardHeader className="">
        <CardTitle className='flex items-center gap-3 text-2xl font-extrabold'>
          <Zap className="h-7 w-7" />
          Configurações do Chatbot
        </CardTitle>
        <CardDescription className=" mt-2 text-base">
          Personalize o comportamento do seu assistente virtual do WhatsApp.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-gray-700 font-semibold text-base">Nome da assistente(o)</Label>
          <Input
            id="name"
            name="name"
            value={config.name}
            onChange={handleChange}
            className="mt-1 p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-green-400 focus:border-transparent transition duration-200"
            placeholder="Ex: Clara, Bot de Atendimento"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="personality" className="text-gray-700 font-semibold text-base">Personalidade</Label>
          <Textarea
            id="personality"
            name="personality"
            value={config.personality}
            onChange={handleChange}
            rows={4}
            className="mt-1 p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-green-400 focus:border-transparent transition duration-200 resize-y"
            placeholder="Ex: Sou uma assistente amigável e sempre pronta para ajudar."
          />
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-emerald-500 hover:bg-emerald-600 font-semibold"
        >
          {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
          Salvar Configurações
        </Button>
      </CardContent>
    </Card>
  );
}