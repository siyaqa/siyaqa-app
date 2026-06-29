import { redirect } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";

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

  return (
    <SessionProvider session={session}>
      <div className="min-h-screen bg-[#f8fafc]">
        <Sidebar role={role} />
        <div className="md:ml-64">
          <Header userName={userName} autoEcoleName={autoEcoleName} />
          <main className="p-4 pb-20 md:p-6 md:pb-6">{children}</main>
        </div>
        <MobileNav role={role} />
      </div>
    </SessionProvider>
  );
}
