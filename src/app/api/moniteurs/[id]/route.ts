import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkSubscription } from "@/lib/check-subscription";

// Modifier un moniteur (nom / téléphone)
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const check = await checkSubscription();
  if (check.error) return check.error;
  const { session, autoEcoleId } = check;

  const role = (session.user as Record<string, unknown>).role as string;
  if (role !== "GERANT") return Response.json({ error: "Accès refusé" }, { status: 403 });

  const { id } = await params;
  const existing = await prisma.user.findFirst({ where: { id, autoEcoleId, role: "MONITEUR" } });
  if (!existing) return Response.json({ error: "Moniteur introuvable" }, { status: 404 });

  const body = await request.json();
  const data: Record<string, unknown> = {};
  if (body.fullName !== undefined) {
    if (!body.fullName) return Response.json({ error: "Le nom est requis" }, { status: 400 });
    data.fullName = body.fullName;
  }
  if (body.phone !== undefined) data.phone = body.phone || null;

  const updated = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, fullName: true, phone: true, isActive: true },
  });
  return NextResponse.json(updated);
}

// Supprimer un moniteur
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const check = await checkSubscription();
  if (check.error) return check.error;
  const { session, autoEcoleId } = check;

  const role = (session.user as Record<string, unknown>).role as string;
  if (role !== "GERANT") return Response.json({ error: "Accès refusé" }, { status: 403 });

  const { id } = await params;
  const existing = await prisma.user.findFirst({ where: { id, autoEcoleId, role: "MONITEUR" } });
  if (!existing) return Response.json({ error: "Moniteur introuvable" }, { status: 404 });

  // Détache le moniteur de ses heures de conduite (elles restent, sans moniteur),
  // puis supprime le compte. Les séances se détachent automatiquement (SET NULL).
  await prisma.$transaction([
    prisma.drivingHour.updateMany({ where: { moniteurId: id }, data: { moniteurId: null } }),
    prisma.user.delete({ where: { id } }),
  ]);
  return NextResponse.json({ ok: true });
}
