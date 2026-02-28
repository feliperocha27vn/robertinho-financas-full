export const getUnpaidExpensesOfCurrentMonthDeclaration = {
  name: 'get_unpaid_expenses_of_current_month',
  description:
    'Obtém uma lista de todas as contas que ainda não foram pagas neste mês e as que estão atrasadas, incluindo despesas fixas e parcelas pendentes. Use esta função quando o usuário perguntar "o que eu tenho pra pagar", "o que falta pagar este mês", "minhas contas em aberto", etc.',
  parametersJsonSchema: {
    type: 'object',
    description: 'Parâmetros para listar contas pendentes do mês.',
    properties: {
      message: {
        type: 'string',
        description:
          'Gere uma mensagem curta e amigável confirmando que está buscando as contas do mês atual. Exemplo: "Certo! Vou dar uma olhada no que você tem para pagar este mês.", "Um segundo, estou listando suas contas pendentes deste mês! 🗓️"',
      },
    },
    required: ['message'],
  },
}
