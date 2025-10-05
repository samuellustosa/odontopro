"use server";

import { Session } from "next-auth";
import { Subscription } from "@/generated/prisma"; // Caminho de importação corrigido
import { ResultPermissionProp } from "./canPermission";
import { PLANS } from "../plans";

export async function canUseChatbot(
  subscription: Subscription | null,
  session: Session
): Promise<ResultPermissionProp> {

  if (subscription && subscription.status === "active" && subscription.plan === "PROFESSIONAL") {
    return {
      hasPermission: true,
      planId: subscription.plan,
      expired: false,
      plan: PLANS[subscription.plan],
    };
  }

  return {
    hasPermission: false,
    planId: "BASIC", // Ou o plano atual do usuário
    expired: false,
    plan: null,
  };
}