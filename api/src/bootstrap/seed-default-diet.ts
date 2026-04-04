import { useCases } from '../factories/make-use-cases'

const DEFAULT_USER_ID = 'default-user'

export async function seedDefaultDiet(): Promise<void> {
  const existing = await useCases.getCurrentDiet.execute({
    userId: DEFAULT_USER_ID,
  })

  if (existing) {
    return
  }

  await useCases.importCurrentDiet.execute({
    userId: DEFAULT_USER_ID,
    title: 'Dieta 2200kcal',
    targetCalories: 2200,
    meals: [
      {
        name: 'Refeicao 1',
        timeLabel: '07:00',
        options: [
          {
            label: 'Opcao 1',
            items: [
              {
                name: 'pao integral',
                amount: 2,
                unit: 'fatias',
                estimatedCalories: 140,
                foodGroup: 'CARB',
              },
              {
                name: 'ovos inteiros mexidos',
                amount: 2,
                unit: 'unidades',
                estimatedCalories: 140,
                foodGroup: 'PROTEIN',
              },
              {
                name: 'banana media',
                amount: 1,
                unit: 'unidade',
                estimatedCalories: 90,
                foodGroup: 'FRUIT',
              },
            ],
          },
          {
            label: 'Opcao 2',
            items: [
              {
                name: 'whey protein',
                amount: 1,
                unit: 'scoop',
                estimatedCalories: 120,
                foodGroup: 'PROTEIN',
              },
              {
                name: 'torrada integral',
                amount: 2,
                unit: 'unidades',
                estimatedCalories: 140,
                foodGroup: 'CARB',
              },
              {
                name: 'banana media',
                amount: 1,
                unit: 'unidade',
                estimatedCalories: 90,
                foodGroup: 'FRUIT',
              },
            ],
          },
        ],
      },
      {
        name: 'Refeicao 2',
        timeLabel: '11:30',
        options: [
          {
            label: 'Opcao 1',
            items: [
              {
                name: 'arroz branco cozido',
                amount: 120,
                unit: 'g',
                estimatedCalories: 160,
                foodGroup: 'CARB',
              },
              {
                name: 'peito de frango grelhado',
                amount: 150,
                unit: 'g',
                estimatedCalories: 240,
                foodGroup: 'PROTEIN',
              },
              {
                name: 'batata doce cozida',
                amount: 100,
                unit: 'g',
                estimatedCalories: 80,
                foodGroup: 'CARB',
              },
            ],
          },
        ],
      },
      {
        name: 'Refeicao 3',
        timeLabel: '16:00',
        options: [
          {
            label: 'Opcao 1',
            items: [
              {
                name: 'whey protein',
                amount: 1,
                unit: 'scoop',
                estimatedCalories: 120,
                foodGroup: 'PROTEIN',
              },
              {
                name: 'pao integral',
                amount: 2,
                unit: 'fatias',
                estimatedCalories: 140,
                foodGroup: 'CARB',
              },
              {
                name: 'banana media',
                amount: 1,
                unit: 'unidade',
                estimatedCalories: 90,
                foodGroup: 'FRUIT',
              },
            ],
          },
        ],
      },
      {
        name: 'Refeicao 4',
        timeLabel: '20:00',
        options: [
          {
            label: 'Opcao 1',
            items: [
              {
                name: 'arroz branco cozido',
                amount: 100,
                unit: 'g',
                estimatedCalories: 130,
                foodGroup: 'CARB',
              },
              {
                name: 'patinho moido',
                amount: 150,
                unit: 'g',
                estimatedCalories: 260,
                foodGroup: 'PROTEIN',
              },
            ],
          },
        ],
      },
    ],
  })
}
