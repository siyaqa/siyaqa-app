import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Non authentifié" }, { status: 401 });
  }

  const autoEcoleId = (session.user as Record<string, unknown>).autoEcoleId as string;

  const moniteurs = await prisma.user.findMany({
    where: { autoEcoleId, role: "MONITEUR" },
    select: {
      id: true,
      fullName: true,
      username: true,
      phone: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(moniteurs);
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
  const { fullName, username, password, phone } = body;

  if (!fullName || !username || !password) {
    return Response.json({ error: "Champs requis manquants" }, { status: 400 });
  }

  // Check if username already exists
  const existing = await prisma.user.findUnique({
    where: { username },
  });

  if (existing) {
    return Response.json({ error: "Nom d'utilisateur déjà pris" }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const moniteur = await prisma.user.create({
    data: {
      fullName,
      username,
      hashedPassword,
      phone: phone || null,
      role: "MONITEUR",
      autoEcoleId,
    },
    select: {
      id: true,
      fullName: true,
      username: true,
      phone: true,
      isActive: true,
      createdAt: true,
    },
  });

  return NextResponse.json(moniteur, { status: 201 });
}
