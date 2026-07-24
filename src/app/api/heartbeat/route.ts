import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Ping de présence — met à jour users.lastSeenAt tant que l'app est ouverte
export async function POST() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { lastSeenAt: new Date() },
    });
  } catch {
    // le ping ne doit jamais faire d'erreur visible côté client
  }

  return new NextResponse(null, { status: 204 });
}
