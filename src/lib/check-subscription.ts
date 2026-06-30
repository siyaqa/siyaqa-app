import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function checkSubscription() {
  const session = await auth();

  if (!session?.user) {
    return { error: NextResponse.json({ error: "Non authentifié" }, { status: 401 }) };
  }

  const user = session.user as Record<string, unknown>;
  const autoEcoleId = user.autoEcoleId as string;

  const autoEcole = await prisma.autoEcole.findUnique({
    where: { id: autoEcoleId },
    select: { isActive: true, trialEndsAt: true },
  });

  if (!autoEcole) {
    return { error: NextResponse.json({ error: "Compte introuvable" }, { status: 403 }) };
  }

  const GRACE_PERIOD_DAYS = 7;
  const now = new Date();
  const expiresAt = new Date(autoEcole.trialEndsAt);
  const graceLimitDate = new Date(expiresAt);
  graceLimitDate.setDate(graceLimitDate.getDate() + GRACE_PERIOD_DAYS);

  if (!autoEcole.isActive || now > graceLimitDate) {
    return { error: NextResponse.json({ error: "Abonnement expiré" }, { status: 403 }) };
  }

  return { session, autoEcoleId };
}
