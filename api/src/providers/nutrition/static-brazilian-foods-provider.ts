import type {
  FoodNutritionLookup,
  FoodNutritionResult,
  NutritionProvider,
} from './nutrition-provider'

interface FoodSeed {
  aliases: string[]
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  foodGroup: FoodNutritionResult['foodGroup']
  defaultAmount: number
  defaultUnit: string
}

const FOODS: Record<string, FoodSeed> = {
  banana: {
    aliases: ['banana', 'banana prata', 'banana media'],
    calories: 98,
    protein: 1.3,
    carbs: 26,
    fat: 0.1,
    fiber: 2,
    foodGroup: 'FRUIT',
    defaultAmount: 100,
    defaultUnit: 'g',
  },
  maca: {
    aliases: ['maca', 'maça'],
    calories: 84,
    protein: 0.3,
    carbs: 22,
    fat: 0.2,
    fiber: 2,
    foodGroup: 'FRUIT',
    defaultAmount: 100,
    defaultUnit: 'g',
  },
  pera: {
    aliases: ['pera'],
    calories: 96,
    protein: 0.4,
    carbs: 26,
    fat: 0.2,
    fiber: 3,
    foodGroup: 'FRUIT',
    defaultAmount: 100,
    defaultUnit: 'g',
  },
  goiaba: {
    aliases: ['goiaba'],
    calories: 54,
    protein: 1,
    carbs: 13,
    fat: 0.4,
    fiber: 6,
    foodGroup: 'FRUIT',
    defaultAmount: 100,
    defaultUnit: 'g',
  },
  mamao: {
    aliases: ['mamao', 'mamão'],
    calories: 45,
    protein: 0.6,
    carbs: 11,
    fat: 0.1,
    fiber: 1.8,
    foodGroup: 'FRUIT',
    defaultAmount: 100,
    defaultUnit: 'g',
  },
  'arroz branco cozido': {
    aliases: ['arroz', 'arroz branco cozido'],
    calories: 128,
    protein: 2.5,
    carbs: 28.1,
    fat: 0.2,
    fiber: 1.6,
    foodGroup: 'CARB',
    defaultAmount: 100,
    defaultUnit: 'g',
  },
  'batata doce cozida': {
    aliases: ['batata doce', 'batata doce cozida'],
    calories: 77,
    protein: 0.6,
    carbs: 18.4,
    fat: 0.1,
    fiber: 2.2,
    foodGroup: 'CARB',
    defaultAmount: 100,
    defaultUnit: 'g',
  },
  'mandioca cozida': {
    aliases: ['mandioca', 'mandioca cozida', 'aipim', 'macaxeira'],
    calories: 125,
    protein: 1,
    carbs: 30,
    fat: 0.3,
    fiber: 1.6,
    foodGroup: 'CARB',
    defaultAmount: 100,
    defaultUnit: 'g',
  },
  'peito de frango grelhado': {
    aliases: ['frango', 'peito de frango', 'peito de frango grelhado'],
    calories: 159,
    protein: 32,
    carbs: 0,
    fat: 3,
    fiber: 0,
    foodGroup: 'PROTEIN',
    defaultAmount: 100,
    defaultUnit: 'g',
  },
  tilapia: {
    aliases: ['tilapia', 'tilápia'],
    calories: 129,
    protein: 26,
    carbs: 0,
    fat: 2.7,
    fiber: 0,
    foodGroup: 'PROTEIN',
    defaultAmount: 100,
    defaultUnit: 'g',
  },
  'patinho moido': {
    aliases: ['patinho', 'patinho moido', 'patinho moído'],
    calories: 170,
    protein: 26,
    carbs: 0,
    fat: 7,
    fiber: 0,
    foodGroup: 'PROTEIN',
    defaultAmount: 100,
    defaultUnit: 'g',
  },
}

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export class StaticBrazilianFoodsProvider implements NutritionProvider {
  async searchFood(
    input: FoodNutritionLookup
  ): Promise<FoodNutritionResult | null> {
    const query = normalize(input.query)
    const found = Object.entries(FOODS).find(([, seed]) =>
      seed.aliases.some(alias => normalize(alias) === query)
    )

    if (!found) {
      return null
    }

    const [displayName, seed] = found

    return {
      displayName,
      normalizedName: normalize(displayName),
      amount: input.amount ?? seed.defaultAmount,
      unit: input.unit ?? seed.defaultUnit,
      calories: seed.calories,
      protein: seed.protein,
      carbs: seed.carbs,
      fat: seed.fat,
      fiber: seed.fiber,
      foodGroup: seed.foodGroup,
      sourceType: 'BRAZIL_STATIC',
      sourceRef: 'TACO-like static seed',
      confidence: 'high',
    }
  }
}
