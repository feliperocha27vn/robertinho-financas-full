import type {
  DietPlan,
  DietRepository,
  ReplaceDietPlanInput,
  UpdateDietFoodItemInput,
} from '../contracts/diet-repository'

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function randomId(): string {
  return Math.random().toString(36).slice(2)
}

export class InMemoryDietRepository implements DietRepository {
  private plansByUser = new Map<string, DietPlan>()

  async getActiveByUserId(userId: string): Promise<DietPlan | null> {
    return this.plansByUser.get(userId) ?? null
  }

  async replaceActivePlan(input: ReplaceDietPlanInput): Promise<DietPlan> {
    const plan: DietPlan = {
      id: randomId(),
      userId: input.userId,
      title: input.title,
      targetCalories: input.targetCalories ?? null,
      meals: input.meals.map((meal, mealIndex) => ({
        id: randomId(),
        name: meal.name,
        timeLabel: meal.timeLabel ?? null,
        displayOrder: mealIndex + 1,
        options: meal.options.map(option => ({
          id: randomId(),
          label: option.label,
          items: option.items.map(item => ({
            id: randomId(),
            name: item.name,
            normalizedName: normalize(item.name),
            amount: item.amount ?? null,
            unit: item.unit ?? null,
            estimatedCalories: item.estimatedCalories ?? null,
            foodGroup: item.foodGroup ?? 'OTHER',
            notes: item.notes ?? null,
          })),
        })),
      })),
    }

    this.plansByUser.set(input.userId, plan)
    return plan
  }

  async updateFoodItem(input: UpdateDietFoodItemInput): Promise<void> {
    const current = this.plansByUser.get(input.userId)
    if (!current) {
      return
    }

    const meal = current.meals.find(
      item => normalize(item.name) === normalize(input.mealName)
    )
    if (!meal) {
      return
    }

    const option = meal.options.find(
      item => normalize(item.label) === normalize(input.optionLabel)
    )
    if (!option) {
      return
    }

    const itemIndex = option.items.findIndex(
      item => normalize(item.name) === normalize(input.originalFoodName)
    )
    if (itemIndex === -1) {
      return
    }

    option.items[itemIndex] = {
      id: option.items[itemIndex].id,
      name: input.replacement.name,
      normalizedName: normalize(input.replacement.name),
      amount: input.replacement.amount ?? null,
      unit: input.replacement.unit ?? null,
      estimatedCalories: input.replacement.estimatedCalories ?? null,
      foodGroup: input.replacement.foodGroup ?? 'OTHER',
      notes: input.replacement.notes ?? null,
    }
  }
}
