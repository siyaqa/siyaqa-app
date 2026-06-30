import { redirect } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { TrialBanner } from "@/components/layout/trial-banner";

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
  const role = (user.role as string) ?? "MONITEUR";
  const userName = (session.user?.name as string) ?? "Utilisateur";
  const autoEcoleName = (user.autoEcoleName as string) ?? "Auto-école";
  const autoEcoleId = user.autoEcoleId as string;

  // Check subscription status from DB (not JWT) so admin changes take effect immediately
  const autoEcole = await prisma.autoEcole.findUnique({
    where: { id: autoEcoleId },
    select: { isActive: true, trialEndsAt: true, name: true, city: true },
  });

  if (!autoEcole || !autoEcole.isActive || new Date(autoEcole.trialEndsAt) < new Date()) {
    // Notify admin that a client just hit the expired page
    if (autoEcole) {
      try {
        await fetch("https://ntfy.sh/siyaqi-notifications", {
          method: "POST",
          headers: { "Title": "Abonnement expiré", "Priority": "high", "Tags": "warning" },
          body: `${autoEcole.name} — ${autoEcole.city}\nLe client vient d'essayer de se connecter mais son abonnement est expiré.\nContactez-le pour le renouvellement.`,
        });
      } catch {
        // Don't block redirect if notification fails
      }
    }
    redirect("/expired");
  }

  const daysLeft = Math.ceil(
    (new Date(autoEcole.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <SessionProvider session={session}>
      <div className="min-h-screen bg-[#f8fafc]">
        <Sidebar role={role} />
        <div className="md:ml-64">
          <Header userName={userName} autoEcoleName={autoEcoleName} />
          {role === "GERANT" && <TrialBanner daysLeft={daysLeft} />}
          <main className="p-4 pb-20 md:p-6 md:pb-6">{children}</main>
        </div>
        <MobileNav role={role} />
      </div>
    </SessionProvider>
  );
}
