-- CreateTable
CREATE TABLE "CurrencyHistory" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CurrencyHistory_pkey" PRIMARY KEY ("id")
);
