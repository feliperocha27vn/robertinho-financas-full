export const getSumExpensesDeclaration = {
  name: 'get_sum_expenses',
  description:
    'OBRIGATÓRIO: Calcula e retorna o total REAL de todas as despesas registradas no banco de dados. Esta função deve ser chamada SEMPRE que o usuário perguntar sobre total, soma, saldo ou resumo das despesas. A função não recebe parâmetros e retorna o valor total atual do banco de dados.',
  parametersJsonSchema: {
    type: 'object',
    properties: {},
    additionalProperties: false,
    required: []
  }
}