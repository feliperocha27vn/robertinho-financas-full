export type DietFoodGroup =
  | 'CARB'
  | 'PROTEIN'
  | 'FRUIT'
  | 'FAT'
  | 'NUT'
  | 'DAIRY'
  | 'OTHER'

export interface DietFoodItem {
  id: string
  foodCatalogId: string | null
  name: string
  normalizedName: string
  amount: number | null
  unit: string | null
  estimatedCalories: number | null
  foodGroup: DietFoodGroup
  notes: string | null
}

export interface DietMealOption {
  id: string
  label: string
  items: DietFoodItem[]
}

export interface DietMeal {
  id: string
  name: string
  timeLabel: string | null
  displayOrder: number
  options: DietMealOption[]
}

export interface DietPlan {
  id: string
  userId: string
  title: string
  targetCalories: number | null
  meals: DietMeal[]
}

export interface ReplaceDietPlanInput {
  userId: string
  title: string
  targetCalories?: number | null
  meals: Array<{
    name: string
    timeLabel?: string | null
    options: Array<{
      label: string
      items: Array<{
        foodCatalogId?: string | null
        name: string
        amount?: number | null
        unit?: string | null
        estimatedCalories?: number | null
        foodGroup?: DietFoodGroup
        notes?: string | null
      }>
    }>
  }>
}

export interface UpdateDietFoodItemInput {
  userId: string
  mealName: string
  optionLabel: string
  originalFoodName: string
  replacement: {
    foodCatalogId?: string | null
    name: string
    amount?: number | null
    unit?: string | null
    estimatedCalories?: number | null
    foodGroup?: DietFoodGroup
    notes?: string | null
  }
}

export interface DietRepository {
  getActiveByUserId(userId: string): Promise<DietPlan | null>
  replaceActivePlan(input: ReplaceDietPlanInput): Promise<DietPlan>
  updateFoodItem(input: UpdateDietFoodItemInput): Promise<void>
}
