import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Non authentifié" }, { status: 401 });
  }

  const autoEcoleId = (session.user as Record<string, unknown>).autoEcoleId as string;
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
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Non authentifié" }, { status: 401 });
  }

  const role = (session.user as Record<string, unknown>).role as string;
  if (role !== "GERANT") {
    return Response.json({ error: "Accès refusé" }, { status: 403 });
  }

  const autoEcoleId = (session.user as Record<string, unknown>).autoEcoleId as string;
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
