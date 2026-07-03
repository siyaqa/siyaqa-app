import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkSubscription } from "@/lib/check-subscription";

// Modifier une heure de conduite
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const check = await checkSubscription();
  if (check.error) return check.error;
  const { session, autoEcoleId } = check;

  const role = (session.user as Record<string, unknown>).role as string;
  if (role !== "GERANT" && role !== "MONITEUR") return Response.json({ error: "Accès refusé" }, { status: 403 });

  const { id } = await params;
  const existing = await prisma.drivingHour.findFirst({ where: { id, candidate: { autoEcoleId } } });
  if (!existing) return Response.json({ error: "Heure introuvable" }, { status: 404 });

  const body = await request.json();
  const data: Record<string, unknown> = {};
  if (body.duration !== undefined) {
    if (typeof body.duration !== "number" || body.duration <= 0) {
      return Response.json({ error: "Durée invalide" }, { status: 400 });
    }
    data.duration = body.duration;
  }
  if (body.date !== undefined) data.date = new Date(body.date);
  if (body.note !== undefined) data.note = body.note || null;
  if (body.moniteurId !== undefined) {
    if (body.moniteurId) {
      const mon = await prisma.user.findFirst({ where: { id: body.moniteurId, autoEcoleId, role: "MONITEUR" } });
      if (!mon) return Response.json({ error: "Moniteur introuvable" }, { status: 404 });
      data.moniteurId = body.moniteurId;
    } else {
      data.moniteurId = null;
    }
  }

  const updated = await prisma.drivingHour.update({ where: { id }, data });
  return NextResponse.json(updated);
}

// Supprimer une heure de conduite
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const check = await checkSubscription();
  if (check.error) return check.error;
  const { session, autoEcoleId } = check;

  const role = (session.user as Record<string, unknown>).role as string;
  if (role !== "GERANT" && role !== "MONITEUR") return Response.json({ error: "Accès refusé" }, { status: 403 });

  const { id } = await params;
  const existing = await prisma.drivingHour.findFirst({ where: { id, candidate: { autoEcoleId } } });
  if (!existing) return Response.json({ error: "Heure introuvable" }, { status: 404 });

  await prisma.drivingHour.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
