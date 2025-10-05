"use server"

import { auth } from "@/lib/auth";
import { PlanDetailInfo } from "./get-plans";
import prisma from "@/lib/prisma";
import { canCreateService } from "./canCreateService";
import { canUseChatbot } from "./canUseChatbot";

export type PLAN_PROP = "BASIC" | "PROFESSIONAL" | "TRIAL" | "EXPIRED";
type TypeCheck = "service" | "chatbot";

export interface ResultPermissionProp {
  hasPermission: boolean;
  planId: PLAN_PROP;
  expired: boolean;
  plan: PlanDetailInfo | null;
}

interface CanPermissionProps {
  type: TypeCheck;
}

export async function canPermission({ type }: CanPermissionProps): Promise<ResultPermissionProp> {

  const session = await auth();

  if (!session?.user?.id) {
    return {
      hasPermission: false,
      planId: "EXPIRED",
      expired: true,
      plan: null,
    }
  }

  const subscription = await prisma.subscription.findFirst({
    where: {
      userId: session?.user?.id
    }
  })

  switch (type) {
    case "service":
      const permission = await canCreateService(subscription, session)
      return permission;
    case "chatbot":
      const chatbotPermission = await canUseChatbot(subscription, session)
      return chatbotPermission;
    default:
      return {
        hasPermission: false,
        planId: "EXPIRED",
        expired: true,
        plan: null,
      }
  }
}