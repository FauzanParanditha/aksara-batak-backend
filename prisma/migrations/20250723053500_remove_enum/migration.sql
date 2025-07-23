/*
  Warnings:

  - You are about to drop the column `uniqueCode` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `newRole` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "uniqueCode";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "newRole";

-- DropEnum
DROP TYPE "UserRole";
