/*
  Warnings:

  - You are about to drop the column `snapToken` on the `Payment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "snapToken",
ADD COLUMN     "paymentUrl" TEXT;
