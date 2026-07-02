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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#2563eb] mb-4">
          <MailCheck className="w-8 h-8 text-white" />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Confirmez votre email</h1>
            <p className="text-sm text-gray-500">
              Votre compte n'est pas encore activé. Un email de confirmation a été envoyé
              {user?.email ? <> à <b>{user.email}</b></> : ""}. Cliquez sur le lien qu'il contient.
            </p>
          </div>
          <p className="text-xs text-gray-400">Pensez à vérifier vos dossiers Spam / Promotions.</p>
          <ResendButton />
        </div>
        <p className="text-center text-sm text-[#64748b] mt-4">
          <Link href="/login" className="text-[#2563eb] font-medium hover:underline">
            Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  );
}
