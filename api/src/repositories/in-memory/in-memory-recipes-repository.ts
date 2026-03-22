import { randomUUID } from 'node:crypto'
import type { RecipeItem } from '../../domain/finance'
import type {
  CreateRecipeInput,
  RecipesRepository,
} from '../contracts/recipes-repository'

export class InMemoryRecipesRepository implements RecipesRepository {
  public items: RecipeItem[] = []

  async create(input: CreateRecipeInput): Promise<RecipeItem> {
    const recipe: RecipeItem = {
      id: randomUUID(),
      description: input.description,
      amount: input.amount,
      createdAt: new Date(),
    }

    this.items.push(recipe)
    return recipe
  }

  async sumInRange(start: Date, end: Date): Promise<number> {
    return this.items
      .filter(item => item.createdAt >= start && item.createdAt <= end)
      .reduce((total, item) => total + item.amount, 0)
  }
}
