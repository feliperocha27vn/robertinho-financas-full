import { GetHomeDataUseCase } from '../use-cases/summary/get-home-data-use-case'
import { repositories } from './make-repositories'

export function makeGetHomeDataUseCase() {
  return new GetHomeDataUseCase(
    repositories.expenses,
    repositories.installments,
    repositories.recipes
  )
}
