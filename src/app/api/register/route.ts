import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { notifyAdmin } from "@/lib/notify";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, city, fullName, username, password, phone } = body;

    if (!name || !city || !fullName || !username || !password) {
      return NextResponse.json(
        { error: "Tous les champs obligatoires doivent être remplis." },
        { status: 400 }
      );
    }

    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 8 caractères." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Ce nom d'utilisateur est déjà pris." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await prisma.$transaction(async (tx) => {
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 30);

      const autoEcole = await tx.autoEcole.create({
        data: {
          name,
          city,
          phone,
          trialEndsAt,
        },
      });

      const user = await tx.user.create({
        data: {
          username,
          hashedPassword,
          fullName,
          role: "GERANT",
          phone,
          autoEcoleId: autoEcole.id,
        },
      });

      return user;
    });

    const { hashedPassword: _, ...userWithoutPassword } = result;

    // Notify admin of new registration (topic privé via NTFY_TOPIC)
    await notifyAdmin({
      title: "Nouvelle inscription Siyaqi",
      priority: "high",
      tags: "tada",
      body: `${name} — ${city}\nGérant: ${fullName}\nTél: ${phone || "non renseigné"}`,
    });

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'inscription." },
      { status: 500 }
    );
  }
}
