/*
  Warnings:

  - Changed the type of `status` on the `Payment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('unpaid', 'pending', 'waiting_verification', 'paid', 'failed', 'expired', 'rejected');

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "manualProofUrl" TEXT,
ADD COLUMN     "notes" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "PaymentStatus" NOT NULL;
