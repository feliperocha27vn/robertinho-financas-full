export const getSumExpensesOfMonthVariablesDeclaration = {
  name: 'get_sum_expenses_of_month_variables',
  description:
    'Obtém o valor total APENAS das despesas VARIÁVEIS registradas no mês corrente atual. Use esta função EXCLUSIVAMENTE quando o usuário perguntar "quanto eu gastei esse mês?", "qual o total de gastos do mês?", "resumo de gastos variáveis". Não use para perguntar o histórico total (que inclui meses passados) nem para despesas fixas.',
  parametersJsonSchema: {
    type: 'object',
    description: 'Parâmetros para obter o somatório das despesas do mês.',
    properties: {},
    required: [],
  },
}
