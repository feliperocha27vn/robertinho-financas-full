-- CreateTable
CREATE TABLE "diet_plan" (
    "id" UUID NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "target_calories" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "diet_plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diet_meal" (
    "id" UUID NOT NULL,
    "diet_plan_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "time_label" TEXT,
    "display_order" INTEGER NOT NULL,

    CONSTRAINT "diet_meal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diet_meal_option" (
    "id" UUID NOT NULL,
    "diet_meal_id" UUID NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "diet_meal_option_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diet_food_item" (
    "id" UUID NOT NULL,
    "diet_meal_option_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "normalized_name" TEXT NOT NULL,
    "amount" DECIMAL(10,2),
    "unit" TEXT,
    "estimated_calories" DECIMAL(10,2),
    "food_group" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "diet_food_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "diet_plan_user_active_idx" ON "diet_plan"("user_id", "is_active");

-- CreateIndex
CREATE INDEX "diet_meal_plan_order_idx" ON "diet_meal"("diet_plan_id", "display_order");

-- CreateIndex
CREATE INDEX "diet_meal_option_meal_idx" ON "diet_meal_option"("diet_meal_id");

-- CreateIndex
CREATE INDEX "diet_food_item_normalized_name_idx" ON "diet_food_item"("normalized_name");

-- CreateIndex
CREATE INDEX "diet_food_item_option_idx" ON "diet_food_item"("diet_meal_option_id");

-- AddForeignKey
ALTER TABLE "diet_meal" ADD CONSTRAINT "diet_meal_diet_plan_id_fkey" FOREIGN KEY ("diet_plan_id") REFERENCES "diet_plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diet_meal_option" ADD CONSTRAINT "diet_meal_option_diet_meal_id_fkey" FOREIGN KEY ("diet_meal_id") REFERENCES "diet_meal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diet_food_item" ADD CONSTRAINT "diet_food_item_diet_meal_option_id_fkey" FOREIGN KEY ("diet_meal_option_id") REFERENCES "diet_meal_option"("id") ON DELETE CASCADE ON UPDATE CASCADE;
