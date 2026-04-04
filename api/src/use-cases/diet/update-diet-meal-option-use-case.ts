import type { DietRepository } from '../../repositories/contracts/diet-repository'

interface Input {
  userId: string
  mealName: string
  optionLabel: string
  originalFoodName: string
  replacement: {
    name: string
    amount?: number | null
    unit?: string | null
    estimatedCalories?: number | null
    foodGroup?: 'CARB' | 'PROTEIN' | 'FRUIT' | 'FAT' | 'NUT' | 'DAIRY' | 'OTHER'
    notes?: string | null
  }
}

export class UpdateDietMealOptionUseCase {
  constructor(private readonly dietRepository: DietRepository) {}

  async execute(input: Input): Promise<void> {
    await this.dietRepository.updateFoodItem(input)
  }
}
