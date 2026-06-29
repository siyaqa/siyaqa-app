-- AlterTable: add isActive with default
ALTER TABLE "auto_ecoles" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable: add trialEndsAt with temporary default for existing rows
ALTER TABLE "auto_ecoles" ADD COLUMN "trialEndsAt" TIMESTAMP(3);
UPDATE "auto_ecoles" SET "trialEndsAt" = NOW() + INTERVAL '14 days' WHERE "trialEndsAt" IS NULL;
ALTER TABLE "auto_ecoles" ALTER COLUMN "trialEndsAt" SET NOT NULL;
