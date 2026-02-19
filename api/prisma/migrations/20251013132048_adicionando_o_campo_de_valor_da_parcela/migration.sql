/*
  Warnings:

  - Added the required column `value_installment_of_expense` to the `installments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "installments" ADD COLUMN     "value_installment_of_expense" DECIMAL(10,2) NOT NULL;
