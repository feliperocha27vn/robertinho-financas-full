export const getSumExpensesFixedDeclaration = {
  name: 'get_sum_expenses_fixed',
  description:
    'Calcula e retorna a soma EXCLUSIVAMENTE de todas as despesas marcadas como FIXAS (aluguel, condomínio, internet). Esta função é usada QUANDO o usuário perguntar especificamente "qual o total das minhas despesas fixas?" ou "quanto gasto de contas fixas?".',
  parametersJsonSchema: {
    type: 'object',
    description:
      'Parâmetros para buscar a soma das despesas fixas. Nenhum parâmetro é necessário.',
    properties: {
      message: {
        type: 'string',
        description: 'Mensagem confirmando que está somando as despesas fixas.',
      },
    },
    required: ['message'],
  },
}
