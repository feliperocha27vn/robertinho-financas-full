-- AlterTable
ALTER TABLE "diet_food_item"
ADD COLUMN "food_catalog_id" UUID;

-- CreateTable
CREATE TABLE "food_catalog" (
    "id" UUID NOT NULL,
    "canonical_name" TEXT NOT NULL,
    "normalized_name" TEXT NOT NULL,
    "food_group" TEXT NOT NULL,
    "base_amount" DECIMAL(10,2),
    "base_unit" TEXT,
    "calories" DECIMAL(10,2),
    "protein" DECIMAL(10,2),
    "carbs" DECIMAL(10,2),
    "fat" DECIMAL(10,2),
    "fiber" DECIMAL(10,2),
    "source_type" TEXT NOT NULL,
    "source_ref" TEXT,

    CONSTRAINT "food_catalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_alias" (
    "id" UUID NOT NULL,
    "food_catalog_id" UUID NOT NULL,
    "alias" TEXT NOT NULL,
    "alias_normalized" TEXT NOT NULL,

    CONSTRAINT "food_alias_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "food_catalog_normalized_name_key" ON "food_catalog"("normalized_name");

-- CreateIndex
CREATE UNIQUE INDEX "food_alias_alias_normalized_key" ON "food_alias"("alias_normalized");

-- CreateIndex
CREATE INDEX "food_alias_food_catalog_idx" ON "food_alias"("food_catalog_id");

-- CreateIndex
CREATE INDEX "diet_food_item_food_catalog_idx" ON "diet_food_item"("food_catalog_id");

-- AddForeignKey
ALTER TABLE "diet_food_item" ADD CONSTRAINT "diet_food_item_food_catalog_id_fkey" FOREIGN KEY ("food_catalog_id") REFERENCES "food_catalog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_alias" ADD CONSTRAINT "food_alias_food_catalog_id_fkey" FOREIGN KEY ("food_catalog_id") REFERENCES "food_catalog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
