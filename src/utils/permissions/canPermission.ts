"use server"

import { auth } from "@/lib/auth";
import { PlanDetailInfo } from "./get-plans";
import prisma from "@/lib/prisma";

// BASIC | PROFESSIONAL | EXPIRED | TRIAL

export type PLAN_PROP = "BASIC" | "PROFESSIONAL" | "TRIAL" | "EXPIRED";

interface ResultPermissionProp {
  hasPermission: boolean;
  planId: PLAN_PROP;
  expired: boolean;
  plan: PlanDetailInfo | null;
}

interface CanPermissionProps {
  type: string;
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
      // verificar se esse user pode criar quantos serviços com base no plano dele...
      return {
        hasPermission: false,
        planId: "EXPIRED",
        expired: true,
        plan: null,
      }
    default:
      return {
        hasPermission: false,
        planId: "EXPIRED",
        expired: true,
        plan: null,
      }
  }

}