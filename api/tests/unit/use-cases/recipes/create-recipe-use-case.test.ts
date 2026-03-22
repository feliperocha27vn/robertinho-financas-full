import { describe, expect, it } from 'vitest'
import { InMemoryRecipesRepository } from '../../../../src/repositories/in-memory/in-memory-recipes-repository'
import { CreateRecipeUseCase } from '../../../../src/use-cases/recipes/create-recipe-use-case'

describe('CreateRecipeUseCase', () => {
  it('creates a recipe entry', async () => {
    const repository = new InMemoryRecipesRepository()
    const sut = new CreateRecipeUseCase(repository)

    await sut.execute({ description: 'Salario', amount: 3500 })

    expect(repository.items).toHaveLength(1)
    expect(repository.items[0]).toEqual(
      expect.objectContaining({ description: 'Salario', amount: 3500 })
    )
  })
})
