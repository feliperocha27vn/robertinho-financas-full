-- DropForeignKey
ALTER TABLE "public"."installments" DROP CONSTRAINT "installments_expenses_id_fkey";

-- AddForeignKey
ALTER TABLE "installments" ADD CONSTRAINT "installments_expenses_id_fkey" FOREIGN KEY ("expenses_id") REFERENCES "expenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
