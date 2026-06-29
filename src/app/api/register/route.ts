import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

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
      trialEndsAt.setDate(trialEndsAt.getDate() + 14);

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

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'inscription." },
      { status: 500 }
    );
  }
}
