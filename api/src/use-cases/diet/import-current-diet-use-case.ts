import type {
  DietRepository,
  ReplaceDietPlanInput,
} from '../../repositories/contracts/diet-repository'

export class ImportCurrentDietUseCase {
  constructor(private readonly dietRepository: DietRepository) {}

  async execute(input: ReplaceDietPlanInput) {
    if (!input.userId.trim()) {
      throw new Error('userId is required')
    }

    if (!input.title.trim()) {
      throw new Error('title is required')
    }

    return this.dietRepository.replaceActivePlan(input)
  }
}
