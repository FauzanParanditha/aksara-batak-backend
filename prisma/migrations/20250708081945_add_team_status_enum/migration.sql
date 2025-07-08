/*
  Warnings:

  - The `status` column on the `Team` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "TeamStatus" AS ENUM ('draft', 'submitted', 'paid', 'qualified', 'semifinal', 'final', 'eliminated');

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "queueNumber" INTEGER,
DROP COLUMN "status",
ADD COLUMN     "status" "TeamStatus" NOT NULL DEFAULT 'draft';
