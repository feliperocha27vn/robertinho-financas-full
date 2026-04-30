import type { RecipeItem } from '../../lib/types'

export interface CreateRecipeInput {
  description: string
  amount: number
}

export interface RecipesRepository {
  create(input: CreateRecipeInput): Promise<RecipeItem>
  sumInRange(start: Date, end: Date): Promise<number>
}
