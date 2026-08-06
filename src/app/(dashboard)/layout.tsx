import { redirect } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { TrialBanner } from "@/components/layout/trial-banner";
import { PresencePing } from "@/components/layout/presence-ping";
import { notifyAdmin } from "@/lib/notify";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const user = session.user as Record<string, unknown>;

  // Compte non confirmé par email → bloqué tant que l'email n'est pas validé
  if (!user.emailVerified) {
    redirect("/verify-pending");
  }

  const role = (user.role as string) ?? "MONITEUR";
  const userName = (session.user?.name as string) ?? "Utilisateur";
  const autoEcoleName = (user.autoEcoleName as string) ?? "Auto-école";
  const autoEcoleId = user.autoEcoleId as string;

  // Check subscription status from DB (not JWT) so admin changes take effect immediately
  const autoEcole = await prisma.autoEcole.findUnique({
    where: { id: autoEcoleId },
    select: { isActive: true, trialEndsAt: true, name: true, city: true },
  });

  if (!autoEcole) {
    redirect("/expired");
  }

  const GRACE_PERIOD_DAYS = 7;
  const now = new Date();
  const expiresAt = new Date(autoEcole.trialEndsAt);
  const graceLimitDate = new Date(expiresAt);
  graceLimitDate.setDate(graceLimitDate.getDate() + GRACE_PERIOD_DAYS);

  // Account manually disabled or grace period over → block
  if (!autoEcole.isActive || now > graceLimitDate) {
    // Notify admin that a client just got blocked
    await notifyAdmin({
      title: "Compte bloqué",
      priority: "high",
      tags: "no_entry",
      body: `${autoEcole.name} — ${autoEcole.city}\nLe client vient d'être bloqué (fin de période de grâce).\nContactez-le pour le renouvellement.`,
    });
    redirect("/expired");
  }

  // Notify admin first time a client enters grace period (day 31)
  const daysPastExpiry = Math.ceil((now.getTime() - expiresAt.getTime()) / (1000 * 60 * 60 * 24));
  if (daysPastExpiry === 1) {
    await notifyAdmin({
      title: "Abonnement expiré — période de grâce",
      priority: "high",
      tags: "warning",
      body: `${autoEcole.name} — ${autoEcole.city}\nL'abonnement vient d'expirer. Le client a encore ${GRACE_PERIOD_DAYS} jours de grâce.\nContactez-le pour le renouvellement.`,
    });
  }

  const daysLeft = Math.ceil(
    (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <SessionProvider session={session}>
      <PresencePing />
      <div className="min-h-screen bg-background">
        <Sidebar role={role} />
        <div className="md:ml-64">
          <Header userName={userName} autoEcoleName={autoEcoleName} />
          {role === "GERANT" && <TrialBanner daysLeft={daysLeft} />}
          <main className="p-4 pb-24 md:p-6 md:pb-6">
            <div className="mx-auto w-full max-w-6xl">{children}</div>
          </main>
        </div>
        <MobileNav role={role} />
      </div>
    </SessionProvider>
  );
}
