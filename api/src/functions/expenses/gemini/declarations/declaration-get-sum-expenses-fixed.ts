export const getSumExpensesFixedDeclaration = {
  name: 'get_sum_expenses_fixed',
  description:
    'Calcula e retorna a soma de todas as despesas marcadas como fixas. Esta função não recebe parâmetros e é usada para obter o valor total gasto em despesas recorrentes ou fixas.',
  parametersJsonSchema: {
    type: 'object',
    description:
      'Parâmetros para buscar a soma das despesas fixas. Nenhum parâmetro é necessário.',
    properties: {},
    required: [],
  },
}
