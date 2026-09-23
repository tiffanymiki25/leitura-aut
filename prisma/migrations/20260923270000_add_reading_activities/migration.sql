CREATE TABLE "ReadingActivity" (
  "id" TEXT NOT NULL,
  "state" "ReadingState" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "userId" TEXT NOT NULL,
  "bookId" TEXT NOT NULL,
  CONSTRAINT "ReadingActivity_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ReadingActivity" ADD CONSTRAINT "ReadingActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReadingActivity" ADD CONSTRAINT "ReadingActivity_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX "ReadingActivity_createdAt_idx" ON "ReadingActivity"("createdAt");
CREATE INDEX "ReadingActivity_bookId_createdAt_idx" ON "ReadingActivity"("bookId", "createdAt");
