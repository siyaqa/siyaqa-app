-- Email verification on users
ALTER TABLE "users" ADD COLUMN "email" TEXT;
ALTER TABLE "users" ADD COLUMN "emailVerified" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "verifyToken" TEXT;

-- Grandfather existing users as already verified (they predate email confirmation)
UPDATE "users" SET "emailVerified" = "createdAt" WHERE "emailVerified" IS NULL;

-- Referral columns on auto_ecoles
ALTER TABLE "auto_ecoles" ADD COLUMN "referralCode" TEXT;
ALTER TABLE "auto_ecoles" ADD COLUMN "referredById" TEXT;
ALTER TABLE "auto_ecoles" ADD COLUMN "referralRewardsGiven" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "auto_ecoles" ADD COLUMN "referralRewarded" BOOLEAN NOT NULL DEFAULT false;

-- Backfill a unique referral code for existing schools
UPDATE "auto_ecoles" SET "referralCode" = replace(gen_random_uuid()::text, '-', '') WHERE "referralCode" IS NULL;
ALTER TABLE "auto_ecoles" ALTER COLUMN "referralCode" SET NOT NULL;

-- Unique indexes
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_verifyToken_key" ON "users"("verifyToken");
CREATE UNIQUE INDEX "auto_ecoles_referralCode_key" ON "auto_ecoles"("referralCode");

-- Self-referential FK (who referred this school)
ALTER TABLE "auto_ecoles" ADD CONSTRAINT "auto_ecoles_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "auto_ecoles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
