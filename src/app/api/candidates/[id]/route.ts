import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkSubscription } from "@/lib/check-subscription";

// Modifier un candidat
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const check = await checkSubscription();
  if (check.error) return check.error;
  const { session, autoEcoleId } = check;

  const role = (session.user as Record<string, unknown>).role as string;
  if (role !== "GERANT") return Response.json({ error: "Accès refusé" }, { status: 403 });

  const { id } = await params;
  // Le candidat doit appartenir à cette auto-école
  const existing = await prisma.candidate.findFirst({ where: { id, autoEcoleId } });
  if (!existing) return Response.json({ error: "Candidat introuvable" }, { status: 404 });

  const body = await request.json();
  const data: Record<string, unknown> = {};
  if (body.firstName !== undefined) data.firstName = body.firstName;
  if (body.lastName !== undefined) data.lastName = body.lastName;
  if (body.phone !== undefined) data.phone = body.phone;
  if (body.cin !== undefined) data.cin = body.cin || null;
  if (body.gender !== undefined) data.gender = body.gender;
  if (body.permitType !== undefined) data.permitType = body.permitType;
  if (body.status !== undefined) data.status = body.status;
  if (body.totalFee !== undefined) data.totalFee = body.totalFee;

  const updated = await prisma.candidate.update({ where: { id }, data });
  return NextResponse.json(updated);
}

// Supprimer un candidat (supprime en cascade ses paiements, séances et heures)
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const check = await checkSubscription();
  if (check.error) return check.error;
  const { session, autoEcoleId } = check;

  const role = (session.user as Record<string, unknown>).role as string;
  if (role !== "GERANT") return Response.json({ error: "Accès refusé" }, { status: 403 });

  const { id } = await params;
  const existing = await prisma.candidate.findFirst({ where: { id, autoEcoleId } });
  if (!existing) return Response.json({ error: "Candidat introuvable" }, { status: 404 });

  await prisma.candidate.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
