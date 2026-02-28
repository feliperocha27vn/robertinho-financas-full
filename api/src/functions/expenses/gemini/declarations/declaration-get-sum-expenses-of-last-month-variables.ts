export const getSumExpensesOfLastMonthVariablesDeclaration = {
  name: 'get_sum_expenses_of_last_month_variables',
  description:
    'Obtém o valor total das despesas variáveis (compras normais do dia a dia, não fixas e não parceladas) do mês passado.',
  parametersJsonSchema: {
    type: 'object',
    description: 'Nenhum parâmetro é necessário para esta função.',
    properties: {
      message: {
        type: 'string',
        description: 'Mensagem confirmando que está somando os gastos variáveis do mês passado. Ex: "Vamos ver quanto você gastou no mês passado!"',
      },
    },
    required: ['message'],
  },
}
