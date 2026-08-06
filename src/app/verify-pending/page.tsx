import { redirect } from "next/navigation";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ResendButton } from "./resend-button";

export const dynamic = "force-dynamic";

export default async function VerifyPendingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const u = session.user as Record<string, unknown>;
  if (u.emailVerified) redirect("/dashboard"); // déjà confirmé

  const user = await prisma.user.findUnique({
    where: { id: u.id as string },
    select: { email: true },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50/60 via-slate-50 to-slate-50 px-4">
      <div className="w-full max-w-sm text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 shadow-lg shadow-indigo-600/25 mb-4">
          <MailCheck className="w-8 h-8 text-white" />
        </div>
        <div className="bg-card rounded-2xl shadow-sm ring-1 ring-slate-200/70 p-6 sm:p-8 space-y-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 mb-2">Confirmez votre email</h1>
            <p className="text-sm text-muted">
              Votre compte n&apos;est pas encore activé. Un email de confirmation a été envoyé
              {user?.email ? <> à <b>{user.email}</b></> : ""}. Cliquez sur le lien qu&apos;il contient.
            </p>
          </div>
          <p className="text-xs text-muted">Pensez à vérifier vos dossiers Spam / Promotions.</p>
          <ResendButton />
        </div>
        <p className="text-center text-sm text-muted mt-4">
          <Link href="/login" className="inline-flex py-2.5 text-primary font-medium hover:underline">
            Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  );
}
