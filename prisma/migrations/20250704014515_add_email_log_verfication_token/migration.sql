-- CreateEnum
CREATE TYPE "EmailType" AS ENUM ('qr', 'certificate', 'reminder', 'verification', 'annoucncement', 'custom');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('success', 'failed', 'pending');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerificationToken" TEXT;

-- CreateTable
CREATE TABLE "Email_Log" (
    "id" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "type" "EmailType" NOT NULL,
    "status" "EmailStatus" NOT NULL,
    "errorMessage" TEXT,
    "relatedId" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Email_Log_pkey" PRIMARY KEY ("id")
);
