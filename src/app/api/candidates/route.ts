import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Non authentifié" }, { status: 401 });
  }

  const autoEcoleId = (session.user as Record<string, unknown>).autoEcoleId as string;

  const candidates = await prisma.candidate.findMany({
    where: { autoEcoleId },
    include: {
      payments: {
        select: { amount: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const result = candidates.map((c) => {
    const paymentsCount = c.payments.length;
    const paymentsSum = c.payments.reduce((sum, p) => sum + p.amount, 0);
    const { payments, ...rest } = c;
    return { ...rest, paymentsCount, paymentsSum };
  });

  return NextResponse.json(result);
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
  const { firstName, lastName, phone, cin, gender, permitType, totalFee } = body;

  if (!firstName || !lastName || !phone) {
    return Response.json({ error: "Champs requis manquants" }, { status: 400 });
  }

  const candidate = await prisma.candidate.create({
    data: {
      firstName,
      lastName,
      phone,
      cin: cin || null,
      gender: gender || "MALE",
      permitType: permitType || "B",
      totalFee: totalFee || 0,
      autoEcoleId,
    },
  });

  return NextResponse.json(candidate, { status: 201 });
}
