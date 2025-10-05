"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ChatbotConfig } from "@/generated/prisma";

const chatbotSchema = z.object({
  name: z.string().min(1, "O nome do bot é obrigatório"),
  personality: z.string().min(1, "A personalidade é obrigatória"),
  enabled: z.boolean(),
});

export type ChatbotFormData = z.infer<typeof chatbotSchema>;

interface UseChatbotFormProps {
  initialValues?: ChatbotConfig | null;
}

export function useChatbotForm({ initialValues }: UseChatbotFormProps) {
  return useForm<ChatbotFormData>({
    resolver: zodResolver(chatbotSchema),
    defaultValues: {
      name: initialValues?.name || "Assistente Virtual",
      personality: initialValues?.personality || "Gentil, amigável, educado, profissional",
      enabled: initialValues?.enabled ?? false,
    },
  });
}