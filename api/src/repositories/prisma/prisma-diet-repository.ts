import type {
  DietFoodGroup,
  DietPlan,
  DietRepository,
  ReplaceDietPlanInput,
  UpdateDietFoodItemInput,
} from '../contracts/diet-repository'
import { prisma } from '../../lib/prisma'

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null
  }

  return Number(value)
}

export class PrismaDietRepository implements DietRepository {
  async getActiveByUserId(userId: string): Promise<DietPlan | null> {
    const plan = await prisma.dietPlan.findFirst({
      where: {
        userId,
        isActive: true,
      },
      include: {
        meals: {
          orderBy: { displayOrder: 'asc' },
          include: {
            options: {
              include: {
                items: true,
              },
            },
          },
        },
      },
    })

    if (!plan) {
      return null
    }

    return {
      id: plan.id,
      userId: plan.userId,
      title: plan.title,
      targetCalories: plan.targetCalories,
      meals: plan.meals.map(meal => ({
        id: meal.id,
        name: meal.name,
        timeLabel: meal.timeLabel,
        displayOrder: meal.displayOrder,
        options: meal.options.map(option => ({
          id: option.id,
          label: option.label,
          items: option.items.map(item => ({
            id: item.id,
            foodCatalogId: item.foodCatalogId,
            name: item.name,
            normalizedName: item.normalizedName,
            amount: toNumber(item.amount),
            unit: item.unit,
            estimatedCalories: toNumber(item.estimatedCalories),
            foodGroup: item.foodGroup as DietFoodGroup,
            notes: item.notes,
          })),
        })),
      })),
    }
  }

  async replaceActivePlan(input: ReplaceDietPlanInput): Promise<DietPlan> {
    await prisma.$transaction(async tx => {
      await tx.dietPlan.updateMany({
        where: {
          userId: input.userId,
          isActive: true,
        },
        data: {
          isActive: false,
        },
      })

      await tx.dietPlan.create({
        data: {
          userId: input.userId,
          title: input.title,
          targetCalories: input.targetCalories ?? null,
          isActive: true,
          meals: {
            create: input.meals.map((meal, mealIndex) => ({
              name: meal.name,
              timeLabel: meal.timeLabel ?? null,
              displayOrder: mealIndex + 1,
              options: {
                create: meal.options.map(option => ({
                  label: option.label,
                  items: {
                    create: option.items.map(item => ({
                      name: item.name,
                      foodCatalogId: item.foodCatalogId ?? null,
                      normalizedName: normalize(item.name),
                      amount: item.amount ?? null,
                      unit: item.unit ?? null,
                      estimatedCalories: item.estimatedCalories ?? null,
                      foodGroup: item.foodGroup ?? 'OTHER',
                      notes: item.notes ?? null,
                    })),
                  },
                })),
              },
            })),
          },
        },
      })
    })

    const saved = await this.getActiveByUserId(input.userId)
    if (!saved) {
      throw new Error('Unable to save active diet plan')
    }

    return saved
  }

  async updateFoodItem(input: UpdateDietFoodItemInput): Promise<void> {
    const plan = await prisma.dietPlan.findFirst({
      where: {
        userId: input.userId,
        isActive: true,
      },
      include: {
        meals: {
          include: {
            options: {
              include: {
                items: true,
              },
            },
          },
        },
      },
    })

    if (!plan) {
      return
    }

    const meal = plan.meals.find(
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

    const item = option.items.find(
      current => normalize(current.name) === normalize(input.originalFoodName)
    )
    if (!item) {
      return
    }

    await prisma.dietFoodItem.update({
      where: { id: item.id },
      data: {
        name: input.replacement.name,
        foodCatalogId: input.replacement.foodCatalogId ?? item.foodCatalogId,
        normalizedName: normalize(input.replacement.name),
        amount: input.replacement.amount ?? null,
        unit: input.replacement.unit ?? null,
        estimatedCalories: input.replacement.estimatedCalories ?? null,
        foodGroup: input.replacement.foodGroup ?? 'OTHER',
        notes: input.replacement.notes ?? null,
      },
    })
  }
}
