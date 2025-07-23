/*
  Warnings:

  - A unique constraint covering the columns `[teamId]` on the table `UniqueCodePool` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UniqueCodePool_teamId_key" ON "UniqueCodePool"("teamId");

-- AddForeignKey
ALTER TABLE "UniqueCodePool" ADD CONSTRAINT "UniqueCodePool_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
