import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkSubscription } from "@/lib/check-subscription";

export async function GET(request: NextRequest) {
  const check = await checkSubscription();
  if (check.error) return check.error;
  const { autoEcoleId } = check;
  const { searchParams } = request.nextUrl;
  const date = searchParams.get("date");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const moniteurId = searchParams.get("moniteurId");
  const type = searchParams.get("type");

  const where: Record<string, unknown> = {
    candidate: { autoEcoleId },
  };

  if (date) {
    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);
    where.date = { gte: start, lt: end };
  } else if (from && to) {
    where.date = { gte: new Date(from), lt: new Date(to) };
  }

  if (moniteurId) {
    where.moniteurId = moniteurId;
  }

  if (type) {
    where.type = type;
  }

  const sessions = await prisma.session.findMany({
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

  return NextResponse.json(sessions);
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
  const { type, date, startTime, endTime, candidateId, moniteurId } = body;

  if (!type || !date || !startTime || !endTime || !candidateId) {
    return Response.json({ error: "Champs requis manquants" }, { status: 400 });
  }

  // Verify candidate belongs to this auto-école
  const candidate = await prisma.candidate.findFirst({
    where: { id: candidateId, autoEcoleId },
  });

  if (!candidate) {
    return Response.json({ error: "Candidat introuvable" }, { status: 404 });
  }

  // Verify moniteur belongs to this auto-école if provided
  if (moniteurId) {
    const moniteur = await prisma.user.findFirst({
      where: { id: moniteurId, autoEcoleId, role: "MONITEUR" },
    });

    if (!moniteur) {
      return Response.json({ error: "Moniteur introuvable" }, { status: 404 });
    }
  }

  const newSession = await prisma.session.create({
    data: {
      type,
      date: new Date(date),
      startTime,
      endTime,
      candidateId,
      moniteurId: moniteurId || null,
    },
  });

  return NextResponse.json(newSession, { status: 201 });
}
