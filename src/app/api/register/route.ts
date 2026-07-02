import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { notifyAdmin } from "@/lib/notify";
import { sendVerificationEmail } from "@/lib/email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, city, fullName, username, email, password, phone, ref } = body;

    if (!name || !city || !fullName || !username || !email || !password) {
      return NextResponse.json(
        { error: "Tous les champs obligatoires doivent être remplis." },
        { status: 400 }
      );
    }

    if (typeof email !== "string" || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
    }

    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 8 caractères." },
        { status: 400 }
      );
    }

    const normEmail = email.trim().toLowerCase();

    const [existingUser, existingEmail] = await Promise.all([
      prisma.user.findUnique({ where: { username } }),
      prisma.user.findUnique({ where: { email: normEmail } }),
    ]);

    if (existingUser) {
      return NextResponse.json({ error: "Ce nom d'utilisateur est déjà pris." }, { status: 409 });
    }
    if (existingEmail) {
      return NextResponse.json({ error: "Cette adresse email est déjà utilisée." }, { status: 409 });
    }

    // Résolution du code de parrainage (le cas échéant)
    let referredById: string | null = null;
    if (ref && typeof ref === "string") {
      const parrain = await prisma.autoEcole.findUnique({
        where: { referralCode: ref },
        select: { id: true },
      });
      if (parrain) referredById = parrain.id;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verifyToken = randomBytes(32).toString("base64url");

    await prisma.$transaction(async (tx) => {
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 30);

      const autoEcole = await tx.autoEcole.create({
        data: { name, city, phone, trialEndsAt, referredById },
      });

      await tx.user.create({
        data: {
          username,
          hashedPassword,
          fullName,
          role: "GERANT",
          phone,
          email: normEmail,
          verifyToken,
          // emailVerified reste null → compte inactif tant que non confirmé
          autoEcoleId: autoEcole.id,
        },
      });
    });

    // Email de confirmation (obligatoire pour activer le compte)
    await sendVerificationEmail(normEmail, fullName, verifyToken);

    // Notif admin (topic privé)
    await notifyAdmin({
      title: "Nouvelle inscription Siyaqi",
      priority: "high",
      tags: "tada",
      body: `${name} — ${city}\nGérant: ${fullName}\nEmail: ${normEmail}\nTél: ${phone || "non renseigné"}${referredById ? "\n(parrainé)" : ""}`,
    });

    return NextResponse.json(
      { message: "Compte créé. Vérifiez votre email pour l'activer.", needsVerification: true },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'inscription." },
      { status: 500 }
    );
  }
}
