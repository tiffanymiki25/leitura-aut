CREATE TABLE "MonthlyReading" (
  "id" TEXT NOT NULL,
  "month" TIMESTAMP(3) NOT NULL,
  "startDate" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MonthlyReading_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MonthlyReadingBook" (
  "monthlyReadingId" TEXT NOT NULL,
  "bookId" TEXT NOT NULL,
  CONSTRAINT "MonthlyReadingBook_pkey" PRIMARY KEY ("monthlyReadingId", "bookId")
);

CREATE UNIQUE INDEX "MonthlyReading_month_key" ON "MonthlyReading"("month");
ALTER TABLE "MonthlyReadingBook" ADD CONSTRAINT "MonthlyReadingBook_monthlyReadingId_fkey" FOREIGN KEY ("monthlyReadingId") REFERENCES "MonthlyReading"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MonthlyReadingBook" ADD CONSTRAINT "MonthlyReadingBook_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;
