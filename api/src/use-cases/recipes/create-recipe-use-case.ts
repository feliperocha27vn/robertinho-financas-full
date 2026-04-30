import type { RecipesRepository } from '../../repositories/contracts/recipes-repository'

interface Input {
  description: string
  amount: number
}

export class CreateRecipeUseCase {
  constructor(private readonly recipesRepository: RecipesRepository) {}

  async execute(input: Input) {
    const recipe = await this.recipesRepository.create({
      description: input.description,
      amount: input.amount,
    })

    return { recipe }
  }
}
