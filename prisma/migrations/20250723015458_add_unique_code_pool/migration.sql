-- CreateTable
CREATE TABLE "UniqueCodePool" (
    "id" SERIAL NOT NULL,
    "code" INTEGER NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" TIMESTAMP(3),
    "teamId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UniqueCodePool_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UniqueCodePool_code_key" ON "UniqueCodePool"("code");
