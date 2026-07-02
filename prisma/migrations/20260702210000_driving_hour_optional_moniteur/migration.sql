-- Moniteur becomes optional on driving hours (solo owners have no separate moniteur)
ALTER TABLE "driving_hours" ALTER COLUMN "moniteurId" DROP NOT NULL;
