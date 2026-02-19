-- AlterTable
ALTER TABLE "expenses" ADD COLUMN     "isFixed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "numberOfInstallments" INTEGER;
