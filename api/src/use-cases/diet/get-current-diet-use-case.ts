import type { DietPlan, DietRepository } from '../../repositories/contracts/diet-repository'

interface Input {
  userId: string
}

export class GetCurrentDietUseCase {
  constructor(private readonly dietRepository: DietRepository) {}

  async execute(input: Input): Promise<DietPlan | null> {
    const userId = input.userId.trim()
    if (!userId) {
      return null
    }

    return this.dietRepository.getActiveByUserId(userId)
  }
}
