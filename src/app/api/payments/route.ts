import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkSubscription } from "@/lib/check-subscription";

export async function GET(request: NextRequest) {
  const check = await checkSubscription();
  if (check.error) return check.error;
  const { autoEcoleId } = check;
  const { searchParams } = request.nextUrl;
  const candidateId = searchParams.get("candidateId");

  const where: Record<string, unknown> = {
    candidate: { autoEcoleId },
  };

  if (candidateId) {
    where.candidateId = candidateId;
  }

  const payments = await prisma.payment.findMany({
    where,
    include: {
      candidate: {
        select: { firstName: true, lastName: true },
      },
    },
    orderBy: { paidAt: "desc" },
  });

  return NextResponse.json(payments);
}

export async function POST(request: Request) {
  const check = await checkSubscription();
  if (check.error) return check.error;
  const { session, autoEcoleId } = check;

  const role = (session.user as Record<string, unknown>).role as string;
  if (role !== "GERANT") {
    return Response.json({ error: "Accès refusé" }, { status: 403 });
  }
  const body = await request.json();
  const { candidateId, amount, method, note } = body;

  if (!candidateId || !amount || amount <= 0) {
    return Response.json({ error: "Champs requis manquants ou montant invalide" }, { status: 400 });
  }

  // Verify candidate belongs to this auto-école
  const candidate = await prisma.candidate.findFirst({
    where: { id: candidateId, autoEcoleId },
  });

  if (!candidate) {
    return Response.json({ error: "Candidat introuvable" }, { status: 404 });
  }

  const payment = await prisma.payment.create({
    data: {
      candidateId,
      amount,
      method: method || "CASH",
      note: note || null,
    },
  });

  return NextResponse.json(payment, { status: 201 });
}
