import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkSubscription } from "@/lib/check-subscription";
import bcrypt from "bcryptjs";

// Identifiant de connexion dérivé du nom complet (le moniteur n'a pas d'email)
function slugify(s: string): string {
  return (
    s
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "") // enlève les accents
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, ".")
      .replace(/^\.+|\.+$/g, "") || "moniteur"
  );
}

async function uniqueUsername(base: string): Promise<string> {
  let candidate = base;
  let i = 1;
  while (await prisma.user.findUnique({ where: { username: candidate } })) {
    i++;
    candidate = `${base}${i}`;
  }
  return candidate;
}

export async function GET() {
  const check = await checkSubscription();
  if (check.error) return check.error;
  const { autoEcoleId } = check;

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
  const check = await checkSubscription();
  if (check.error) return check.error;
  const { session, autoEcoleId } = check;

  const role = (session.user as Record<string, unknown>).role as string;
  if (role !== "GERANT") {
    return Response.json({ error: "Accès refusé" }, { status: 403 });
  }
  const body = await request.json();
  const { fullName, phone } = body;

  if (!fullName) {
    return Response.json({ error: "Le nom est requis" }, { status: 400 });
  }

  // Moniteur = simple nom (pas de connexion pour l'instant). On garde un
  // identifiant unique pour l'attribution, et un mot de passe aléatoire inutilisé.
  const username = await uniqueUsername(slugify(fullName));
  const hashedPassword = await bcrypt.hash(randomBytes(24).toString("hex"), 12);

  const moniteur = await prisma.user.create({
    data: {
      fullName,
      username,
      hashedPassword,
      phone: phone || null,
      role: "MONITEUR",
      emailVerified: new Date(), // compte interne créé par le gérant → pas de confirmation email
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
