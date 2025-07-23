/*
  Warnings:

  - You are about to drop the `Judge` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'leader', 'judge');

-- DropForeignKey
ALTER TABLE "Score" DROP CONSTRAINT "Score_judgeId_fkey";

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "uniqueCode" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "newRole" "UserRole";

-- DropTable
DROP TABLE "Judge";

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_judgeId_fkey" FOREIGN KEY ("judgeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
