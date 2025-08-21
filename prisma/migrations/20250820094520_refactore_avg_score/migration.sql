-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "avgScore" DOUBLE PRECISION,
ADD COLUMN     "judgeCount" INTEGER;

-- CreateTable
CREATE TABLE "JudgeScoreAggregate" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "judgeId" TEXT NOT NULL,
    "weightedScore" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JudgeScoreAggregate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JudgeScoreAggregate_teamId_weightedScore_idx" ON "JudgeScoreAggregate"("teamId", "weightedScore");

-- CreateIndex
CREATE UNIQUE INDEX "JudgeScoreAggregate_teamId_judgeId_key" ON "JudgeScoreAggregate"("teamId", "judgeId");

-- CreateIndex
CREATE INDEX "Team_status_idx" ON "Team"("status");

-- CreateIndex
CREATE INDEX "Team_avgScore_idx" ON "Team"("avgScore");

-- AddForeignKey
ALTER TABLE "JudgeScoreAggregate" ADD CONSTRAINT "JudgeScoreAggregate_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JudgeScoreAggregate" ADD CONSTRAINT "JudgeScoreAggregate_judgeId_fkey" FOREIGN KEY ("judgeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
