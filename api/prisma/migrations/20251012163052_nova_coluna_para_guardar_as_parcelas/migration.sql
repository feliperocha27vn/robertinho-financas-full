-- CreateTable
CREATE TABLE "installments" (
    "id" UUID NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "dueDate" DATE NOT NULL,
    "expenses_id" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "installments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "installments" ADD CONSTRAINT "installments_expenses_id_fkey" FOREIGN KEY ("expenses_id") REFERENCES "expenses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
