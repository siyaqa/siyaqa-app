-- Link an auto-generated driving hour to the Planning session that produced it
ALTER TABLE "driving_hours" ADD COLUMN "sourceSessionId" TEXT;
CREATE UNIQUE INDEX "driving_hours_sourceSessionId_key" ON "driving_hours"("sourceSessionId");
ALTER TABLE "driving_hours" ADD CONSTRAINT "driving_hours_sourceSessionId_fkey" FOREIGN KEY ("sourceSessionId") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
