/*
  Warnings:

  - A unique constraint covering the columns `[judgeId,teamId,criteria]` on the table `Score` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Score_judgeId_teamId_criteria_key" ON "Score"("judgeId", "teamId", "criteria");
