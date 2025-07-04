/*
  Warnings:

  - Added the required column `body` to the `Email_Log` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Email_Log" ADD COLUMN     "body" TEXT NOT NULL;
