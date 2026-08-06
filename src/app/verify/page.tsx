import Link from "next/link";
import { CheckCircle, XCircle, Car } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { awardReferralOnVerify } from "@/lib/referral";

export const dynamic = "force-dynamic";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  let ok = false;

  if (token) {
    const user = await prisma.user.findUnique({
      where: { verifyToken: token },
      select: { id: true, autoEcoleId: true, emailVerified: true },
    });

    if (user) {
      // Active le compte et invalide le jeton
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date(), verifyToken: null },
      });
      // Récompense le parrain (idempotent, plafonné)
      await awardReferralOnVerify(user.autoEcoleId);
      ok = true;
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50/60 via-slate-50 to-slate-50 px-4">
      <div className="w-full max-w-sm text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 shadow-lg shadow-indigo-600/25 mb-4">
          <Car className="w-7 h-7 text-white" />
        </div>
        {ok ? (
          <div className="bg-card rounded-2xl shadow-sm ring-1 ring-slate-200/70 p-6 sm:p-8 animate-[pop_.18s_ease-out]">
            <div className="w-16 h-16 rounded-full bg-success-light flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">Compte activé !</h1>
            <p className="text-sm text-muted mb-5">
              Votre email est confirmé. Vous pouvez maintenant vous connecter.
            </p>
            <Link
              href="/login"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-white text-base font-semibold hover:bg-primary-hover shadow-sm shadow-primary/25 active:scale-[0.98] transition"
            >
              Se connecter
            </Link>
          </div>
        ) : (
          <div className="bg-card rounded-2xl shadow-sm ring-1 ring-slate-200/70 p-6 sm:p-8">
            <div className="w-16 h-16 rounded-full bg-danger-light flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-danger" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 mb-2">Lien invalide</h1>
            <p className="text-sm text-muted mb-5">
              Ce lien de confirmation est invalide, expiré, ou votre compte est déjà activé.
            </p>
            <Link
              href="/login"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border bg-card text-base font-medium text-foreground/80 hover:bg-surface-2 transition"
            >
              Aller à la connexion
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
