import { redirect } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
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
  const isActive = user.autoEcoleIsActive as boolean;
  const trialEndsAt = user.autoEcoleTrialEndsAt as string;

  // Check if trial expired and account not manually activated
  if (!isActive || (trialEndsAt && new Date(trialEndsAt) < new Date())) {
    redirect("/expired");
  }

  const daysLeft = Math.ceil(
    (new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
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
