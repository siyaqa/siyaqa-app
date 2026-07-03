import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkSubscription } from "@/lib/check-subscription";

export async function GET(request: NextRequest) {
  const check = await checkSubscription();
  if (check.error) return check.error;
  const { autoEcoleId } = check;
  const { searchParams } = request.nextUrl;
  const candidateId = searchParams.get("candidateId");
  const moniteurId = searchParams.get("moniteurId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where: Record<string, unknown> = {
    candidate: { autoEcoleId },
  };

  if (candidateId) where.candidateId = candidateId;
  if (moniteurId) where.moniteurId = moniteurId;
  if (from || to) {
    const range: Record<string, Date> = {};
    if (from) range.gte = new Date(from);
    if (to) {
      const end = new Date(to);
      end.setDate(end.getDate() + 1); // inclut le jour "au"
      range.lt = end;
    }
    where.date = range;
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
  const check = await checkSubscription();
  if (check.error) return check.error;
  const { session, autoEcoleId } = check;

  const role = (session.user as Record<string, unknown>).role as string;
  if (role !== "GERANT" && role !== "MONITEUR") {
    return Response.json({ error: "Accès refusé" }, { status: 403 });
  }
  const body = await request.json();
  const { candidateId, moniteurId, date, duration, note } = body;

  if (!candidateId || !date) {
    return Response.json({ error: "Champs requis manquants" }, { status: 400 });
  }

  // Verify candidate belongs to this auto-école
  const candidate = await prisma.candidate.findFirst({
    where: { id: candidateId, autoEcoleId },
  });

  if (!candidate) {
    return Response.json({ error: "Candidat introuvable" }, { status: 404 });
  }

  // Moniteur optionnel : on ne le vérifie que s'il est fourni
  if (moniteurId) {
    const moniteur = await prisma.user.findFirst({
      where: { id: moniteurId, autoEcoleId, role: "MONITEUR" },
    });
    if (!moniteur) {
      return Response.json({ error: "Moniteur introuvable" }, { status: 404 });
    }
  }

  const drivingHour = await prisma.drivingHour.create({
    data: {
      candidateId,
      moniteurId: moniteurId || null,
      date: new Date(date),
      duration: duration ?? 60,
      note: note || null,
    },
  });

  return NextResponse.json(drivingHour, { status: 201 });
}
