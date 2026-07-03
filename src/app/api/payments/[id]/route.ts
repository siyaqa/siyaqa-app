import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkSubscription } from "@/lib/check-subscription";

// Modifier un paiement
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const check = await checkSubscription();
  if (check.error) return check.error;
  const { session, autoEcoleId } = check;

  const role = (session.user as Record<string, unknown>).role as string;
  if (role !== "GERANT") return Response.json({ error: "Accès refusé" }, { status: 403 });

  const { id } = await params;
  // Le paiement doit appartenir à un candidat de cette auto-école
  const existing = await prisma.payment.findFirst({ where: { id, candidate: { autoEcoleId } } });
  if (!existing) return Response.json({ error: "Paiement introuvable" }, { status: 404 });

  const body = await request.json();
  const data: Record<string, unknown> = {};
  if (body.amount !== undefined) {
    if (typeof body.amount !== "number" || body.amount <= 0) {
      return Response.json({ error: "Montant invalide" }, { status: 400 });
    }
    data.amount = body.amount;
  }
  if (body.method !== undefined) data.method = body.method;
  if (body.note !== undefined) data.note = body.note || null;

  const updated = await prisma.payment.update({ where: { id }, data });
  return NextResponse.json(updated);
}

// Supprimer un paiement
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const check = await checkSubscription();
  if (check.error) return check.error;
  const { session, autoEcoleId } = check;

  const role = (session.user as Record<string, unknown>).role as string;
  if (role !== "GERANT") return Response.json({ error: "Accès refusé" }, { status: 403 });

  const { id } = await params;
  const existing = await prisma.payment.findFirst({ where: { id, candidate: { autoEcoleId } } });
  if (!existing) return Response.json({ error: "Paiement introuvable" }, { status: 404 });

  await prisma.payment.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
