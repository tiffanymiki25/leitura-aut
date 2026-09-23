-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ReadingState" AS ENUM ('NOT_STARTED', 'READING', 'FINISHED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL, "email" TEXT NOT NULL, "name" TEXT NOT NULL, "imageUrl" TEXT, "isAdmin" BOOLEAN NOT NULL DEFAULT false, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Club" (
    "id" TEXT NOT NULL DEFAULT 'main', "name" TEXT NOT NULL DEFAULT 'Entre Páginas', "bannerUrl" TEXT, "inviteCode" TEXT NOT NULL, "readingStart" TIMESTAMP(3), "nextMeetingAt" TIMESTAMP(3), "meetingPlace" TEXT, "meetingNotes" TEXT, "currentBookId" TEXT,
    CONSTRAINT "Club_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Book" (
    "id" TEXT NOT NULL, "title" TEXT NOT NULL, "author" TEXT NOT NULL, "synopsis" TEXT, "coverUrl" TEXT, "purchaseUrl" TEXT, "isContested" BOOLEAN NOT NULL DEFAULT false, "suggestedById" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Vote" ("userId" TEXT NOT NULL, "bookId" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Vote_pkey" PRIMARY KEY ("userId","bookId"));
CREATE TABLE "ReadingStatus" ("userId" TEXT NOT NULL, "bookId" TEXT NOT NULL, "state" "ReadingState" NOT NULL DEFAULT 'NOT_STARTED', "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "ReadingStatus_pkey" PRIMARY KEY ("userId","bookId"));
CREATE TABLE "Message" ("id" TEXT NOT NULL, "content" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "userId" TEXT NOT NULL, CONSTRAINT "Message_pkey" PRIMARY KEY ("id"));

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Club_inviteCode_key" ON "Club"("inviteCode");
CREATE UNIQUE INDEX "Club_currentBookId_key" ON "Club"("currentBookId");
ALTER TABLE "Club" ADD CONSTRAINT "Club_currentBookId_fkey" FOREIGN KEY ("currentBookId") REFERENCES "Book"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Book" ADD CONSTRAINT "Book_suggestedById_fkey" FOREIGN KEY ("suggestedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReadingStatus" ADD CONSTRAINT "ReadingStatus_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReadingStatus" ADD CONSTRAINT "ReadingStatus_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Message" ADD CONSTRAINT "Message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
