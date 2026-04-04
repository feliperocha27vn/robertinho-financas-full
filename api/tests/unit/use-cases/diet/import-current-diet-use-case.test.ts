import { describe, expect, it } from 'vitest'
import { InMemoryDietRepository } from '../../../../src/repositories/in-memory/in-memory-diet-repository'
import { ImportCurrentDietUseCase } from '../../../../src/use-cases/diet/import-current-diet-use-case'

describe('ImportCurrentDietUseCase', () => {
  it('replaces active user diet plan', async () => {
    const repository = new InMemoryDietRepository()
    const sut = new ImportCurrentDietUseCase(repository)

    await sut.execute({
      userId: 'user-1',
      title: 'Plano Antigo',
      targetCalories: 2000,
      meals: [],
    })

    await sut.execute({
      userId: 'user-1',
      title: 'Dieta 2200kcal',
      targetCalories: 2200,
      meals: [
        {
          name: 'Refeicao 1',
          timeLabel: '07:00',
          options: [
            {
              label: 'Opcao 1',
              items: [{ name: 'banana media', estimatedCalories: 90 }],
            },
          ],
        },
      ],
    })

    const saved = await repository.getActiveByUserId('user-1')
    expect(saved?.title).toBe('Dieta 2200kcal')
    expect(saved?.targetCalories).toBe(2200)
    expect(saved?.meals.length).toBe(1)
  })
})
