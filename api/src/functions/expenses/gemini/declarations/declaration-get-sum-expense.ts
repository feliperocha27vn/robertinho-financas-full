export const getSumExpensesDeclaration = {
  name: 'get_sum_expenses',
  description:
    'OBRIGATÓRIO: Calcula e retorna o total GERAL HISTÓRICO de TODAS as despesas registradas no banco de dados (de todos os tempos, fixas e variáveis). CHAME ESTA FUNÇÃO se o usuário perguntar "quanto já gastei no total da vida?", "qual o meu saldo devedor histórico?", "resumo GERAL". Para gastos apenas do mês atual, prefira get_sum_expenses_of_month_variables.',
  parametersJsonSchema: {
    type: 'object',
    properties: {
      message: {
        type: 'string',
        description: 'Mensagem confirmando que está buscando o total histórico de todas as despesas. Ex: "Vamos ver o total de tudo que já gastou!"',
      },
    },
    additionalProperties: false,
    required: ['message']
  }
}