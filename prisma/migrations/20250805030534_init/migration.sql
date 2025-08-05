-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'judge');

-- CreateEnum
CREATE TYPE "EntryStatus" AS ENUM ('draft', 'submitted', 'reviewed', 'disqualified');

-- CreateEnum
CREATE TYPE "JudgingStage" AS ENUM ('preliminary', 'semifinal', 'final');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Registrar" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "website" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Registrar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DomainEntry" (
    "id" TEXT NOT NULL,
    "domainName" TEXT NOT NULL,
    "description" TEXT,
    "registrarId" TEXT NOT NULL,
    "status" "EntryStatus" NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DomainEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoringCriteria" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScoringCriteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Score" (
    "id" TEXT NOT NULL,
    "judgeId" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "criteriaId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "comment" TEXT,
    "stage" "JudgingStage" NOT NULL DEFAULT 'preliminary',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Score_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Registrar_name_key" ON "Registrar"("name");

-- CreateIndex
CREATE UNIQUE INDEX "DomainEntry_domainName_key" ON "DomainEntry"("domainName");

-- CreateIndex
CREATE UNIQUE INDEX "ScoringCriteria_name_key" ON "ScoringCriteria"("name");

-- AddForeignKey
ALTER TABLE "DomainEntry" ADD CONSTRAINT "DomainEntry_registrarId_fkey" FOREIGN KEY ("registrarId") REFERENCES "Registrar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_judgeId_fkey" FOREIGN KEY ("judgeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "DomainEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_criteriaId_fkey" FOREIGN KEY ("criteriaId") REFERENCES "ScoringCriteria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
