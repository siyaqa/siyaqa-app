import { prisma } from "@/lib/prisma";

export const REFERRAL_BONUS_DAYS = 7;
export const REFERRAL_MAX_REWARDS = 2; // un parrain gagne au maximum 2 × 7j = 14j

/**
 * À appeler quand un filleul confirme son email.
 * Accorde +7 jours au parrain, une seule fois par filleul, dans la limite
 * de REFERRAL_MAX_REWARDS récompenses par parrain. Tout est transactionnel
 * et idempotent (le flag referralRewarded empêche le double comptage).
 */
export async function awardReferralOnVerify(referredAutoEcoleId: string) {
  await prisma.$transaction(async (tx) => {
    const ecole = await tx.autoEcole.findUnique({
      where: { id: referredAutoEcoleId },
      select: { id: true, referredById: true, referralRewarded: true },
    });

    if (!ecole || !ecole.referredById || ecole.referralRewarded) return; // rien à faire

    const parrain = await tx.autoEcole.findUnique({
      where: { id: ecole.referredById },
      select: { id: true, trialEndsAt: true, referralRewardsGiven: true },
    });

    // On marque toujours le filleul comme "traité" pour éviter tout rejeu.
    await tx.autoEcole.update({
      where: { id: ecole.id },
      data: { referralRewarded: true },
    });

    if (!parrain || parrain.referralRewardsGiven >= REFERRAL_MAX_REWARDS) return; // plafond atteint

    // Prolonge depuis max(maintenant, fin d'essai) pour ne pas "perdre" des jours passés.
    const base = new Date(Math.max(Date.now(), new Date(parrain.trialEndsAt).getTime()));
    base.setDate(base.getDate() + REFERRAL_BONUS_DAYS);

    await tx.autoEcole.update({
      where: { id: parrain.id },
      data: {
        trialEndsAt: base,
        referralRewardsGiven: { increment: 1 },
      },
    });
  });
}
