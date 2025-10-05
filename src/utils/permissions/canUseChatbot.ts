"use server";

import { Session } from "next-auth";
import { Subscription } from "@/generated/prisma";
import { ResultPermissionProp } from "./canPermission";
import { PLANS } from "../plans";
import { checkSubscriptionExpired } from "./checkSubscriptionExpired";

export async function canUseChatbot(
  subscription: Subscription | null,
  session: Session
): Promise<ResultPermissionProp> {

  // A API do chatbot está disponível para o plano PROFESSIONAL.
  if (subscription && subscription.status === "active" && subscription.plan === "PROFESSIONAL") {
    return {
      hasPermission: true,
      planId: subscription.plan,
      expired: false,
      plan: PLANS[subscription.plan],
    };
  }

  // Permite o uso do chatbot para o plano TRIAL, verificando se o período de teste não expirou.
  const trialPermission = await checkSubscriptionExpired(session);

  if (trialPermission.hasPermission) {
    return {
      hasPermission: true,
      planId: "TRIAL",
      expired: false,
      plan: null,
    };
  }


  return {
    hasPermission: false,
    planId: "BASIC",
    expired: false,
    plan: null,
  };
}