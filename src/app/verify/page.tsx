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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#2563eb] mb-4">
          <Car className="w-7 h-7 text-white" />
        </div>
        {ok ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Compte activé !</h1>
            <p className="text-sm text-gray-500 mb-5">
              Votre email est confirmé. Vous pouvez maintenant vous connecter.
            </p>
            <Link
              href="/login"
              className="inline-block w-full bg-[#2563eb] text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Se connecter
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Lien invalide</h1>
            <p className="text-sm text-gray-500 mb-5">
              Ce lien de confirmation est invalide, expiré, ou votre compte est déjà activé.
            </p>
            <Link
              href="/login"
              className="inline-block w-full bg-gray-100 text-gray-700 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Aller à la connexion
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
