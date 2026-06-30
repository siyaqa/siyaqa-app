import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ADMIN_SECRET = process.env.ADMIN_SECRET || "siyaqi-admin-2026";

function checkAuth(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${ADMIN_SECRET}`) {
    return false;
  }
  return true;
}

// GET — list all auto-écoles with their gérant
export async function GET(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const ecoles = await prisma.autoEcole.findMany({
    include: {
      users: {
        where: { role: "GERANT" },
        select: { fullName: true, username: true, phone: true },
      },
      _count: { select: { candidates: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(ecoles);
}

// PATCH — activate/extend an auto-école subscription
export async function PATCH(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await request.json();
  const { id, days, expiresAt, isActive } = body;

  if (!id) {
    return NextResponse.json({ error: "ID requis" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};

  if (typeof isActive === "boolean") {
    data.isActive = isActive;
  }

  if (expiresAt) {
    // Set exact expiration date
    data.trialEndsAt = new Date(expiresAt + "T23:59:59");
  } else if (days && typeof days === "number") {
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + days);
    data.trialEndsAt = newDate;
  }

  const updated = await prisma.autoEcole.update({
    where: { id },
    data,
  });

  return NextResponse.json(updated);
}
