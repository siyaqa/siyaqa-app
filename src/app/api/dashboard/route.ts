import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Non authentifié" }, { status: 401 });
  }

  const autoEcoleId = (session.user as Record<string, unknown>).autoEcoleId as string;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    totalCandidates,
    activeCandidates,
    paymentsAgg,
    candidatesWithFees,
    todaySessions,
    recentPayments,
  ] = await Promise.all([
    // Total candidates
    prisma.candidate.count({
      where: { autoEcoleId },
    }),

    // Active candidates (not PERMIS_OBTENU or ABANDONNE)
    prisma.candidate.count({
      where: {
        autoEcoleId,
        status: { notIn: ["PERMIS_OBTENU", "ABANDONNE"] },
      },
    }),

    // Total revenue (sum of all payments)
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { candidate: { autoEcoleId } },
    }),

    // All candidates with their totalFee and payments sum for pending calculation
    prisma.candidate.findMany({
      where: { autoEcoleId },
      select: {
        totalFee: true,
        payments: {
          select: { amount: true },
        },
      },
    }),

    // Today's sessions count
    prisma.session.count({
      where: {
        candidate: { autoEcoleId },
        date: { gte: today, lt: tomorrow },
      },
    }),

    // Recent 5 payments
    prisma.payment.findMany({
      where: { candidate: { autoEcoleId } },
      include: {
        candidate: {
          select: { firstName: true, lastName: true },
        },
      },
      orderBy: { paidAt: "desc" },
      take: 5,
    }),
  ]);

  const totalRevenue = paymentsAgg._sum.amount || 0;

  const pendingPayments = candidatesWithFees.reduce((total, c) => {
    const paid = c.payments.reduce((sum, p) => sum + p.amount, 0);
    const pending = c.totalFee - paid;
    return total + (pending > 0 ? pending : 0);
  }, 0);

  return NextResponse.json({
    totalCandidates,
    activeCandidates,
    totalRevenue,
    pendingPayments,
    todaySessions,
    recentPayments,
  });
}
