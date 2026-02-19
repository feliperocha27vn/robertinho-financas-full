-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('TRANSPORT', 'OTHERS', 'STUDIES', 'RESIDENCE', 'CREDIT');

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "description" "TransactionType" NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);
