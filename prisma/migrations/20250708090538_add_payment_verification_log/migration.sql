-- CreateTable
CREATE TABLE "PaymentVerificationLog" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "verifiedById" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "notes" TEXT,
    "verifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentVerificationLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PaymentVerificationLog" ADD CONSTRAINT "PaymentVerificationLog_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentVerificationLog" ADD CONSTRAINT "PaymentVerificationLog_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
