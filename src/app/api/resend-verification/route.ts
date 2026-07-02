import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const id = (session.user as Record<string, unknown>).id as string;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, fullName: true, emailVerified: true },
  });

  // Rien à faire si déjà confirmé ou pas d'email (on répond ok pour ne pas divulguer d'info)
  if (!user || user.emailVerified || !user.email) {
    return NextResponse.json({ ok: true });
  }

  const verifyToken = randomBytes(32).toString("base64url");
  await prisma.user.update({ where: { id: user.id }, data: { verifyToken } });
  await sendVerificationEmail(user.email, user.fullName, verifyToken);

  return NextResponse.json({ ok: true });
}
