import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ADMIN_SECRET = process.env.ADMIN_SECRET;
if (!ADMIN_SECRET) {
  throw new Error("ADMIN_SECRET environment variable is required");
}

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

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const { id, days, expiresAt, isActive } = body;

  if (!id) {
    return NextResponse.json({ error: "ID requis" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};

  if (typeof isActive === "boolean") {
    data.isActive = isActive;
  }

  if (expiresAt) {
    const date = new Date(expiresAt + "T23:59:59");
    if (isNaN(date.getTime())) {
      return NextResponse.json({ error: "Date invalide" }, { status: 400 });
    }
    data.trialEndsAt = date;
  } else if (typeof days === "number" && Number.isFinite(days) && days > 0 && days <= 365) {
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
