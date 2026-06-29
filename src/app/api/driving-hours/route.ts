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

  const drivingHours = await prisma.drivingHour.findMany({
    where,
    include: {
      candidate: {
        select: { firstName: true, lastName: true },
      },
      moniteur: {
        select: { fullName: true },
      },
    },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(drivingHours);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Non authentifié" }, { status: 401 });
  }

  const role = (session.user as Record<string, unknown>).role as string;
  if (role !== "GERANT" && role !== "MONITEUR") {
    return Response.json({ error: "Accès refusé" }, { status: 403 });
  }

  const autoEcoleId = (session.user as Record<string, unknown>).autoEcoleId as string;
  const body = await request.json();
  const { candidateId, moniteurId, date, duration, note } = body;

  if (!candidateId || !moniteurId || !date) {
    return Response.json({ error: "Champs requis manquants" }, { status: 400 });
  }

  // Verify candidate belongs to this auto-école
  const candidate = await prisma.candidate.findFirst({
    where: { id: candidateId, autoEcoleId },
  });

  if (!candidate) {
    return Response.json({ error: "Candidat introuvable" }, { status: 404 });
  }

  // Verify moniteur belongs to this auto-école
  const moniteur = await prisma.user.findFirst({
    where: { id: moniteurId, autoEcoleId, role: "MONITEUR" },
  });

  if (!moniteur) {
    return Response.json({ error: "Moniteur introuvable" }, { status: 404 });
  }

  const drivingHour = await prisma.drivingHour.create({
    data: {
      candidateId,
      moniteurId,
      date: new Date(date),
      duration: duration ?? 60,
      note: note || null,
    },
  });

  return NextResponse.json(drivingHour, { status: 201 });
}
