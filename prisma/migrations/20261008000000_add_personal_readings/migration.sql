CREATE TABLE "PersonalReading" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "author" TEXT,
  "startedAt" TIMESTAMP(3),
  "finishedAt" TIMESTAMP(3),
  "rating" INTEGER,
  "coverUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "userId" TEXT NOT NULL,
  CONSTRAINT "PersonalReading_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PersonalReading_rating_range" CHECK ("rating" IS NULL OR ("rating" >= 1 AND "rating" <= 5))
);

ALTER TABLE "PersonalReading" ADD CONSTRAINT "PersonalReading_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX "PersonalReading_userId_finishedAt_idx" ON "PersonalReading"("userId", "finishedAt");
