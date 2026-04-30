import { randomUUID } from 'node:crypto'
import type { RecipeItem } from '../lib/types'
import type {
  CreateRecipeInput,
  RecipesRepository,
} from '../repositories/contracts/recipes-repository'

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

  async findAll(): Promise<RecipeItem[]> {
    return [...this.items].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    )
  }

  async findById(id: string): Promise<RecipeItem | null> {
    return this.items.find(item => item.id === id) ?? null
  }

  async update(id: string, input: CreateRecipeInput): Promise<RecipeItem> {
    const item = this.items.find(i => i.id === id)
    if (!item) throw new Error('Recipe not found')
    item.description = input.description
    item.amount = input.amount
    return item
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter(item => item.id !== id)
  }
}
