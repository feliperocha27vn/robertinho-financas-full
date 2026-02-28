export const accountsPayableNextMonthDeclaration = {
  name: 'accounts_payable_next_month',
  description:
    'Obtém uma lista de todas as contas a pagar para o próximo mês, incluindo despesas fixas e parcelas. Use esta função quando o usuário perguntar sobre as contas do próximo mês, despesas futuras, ou o que ele precisa pagar no mês seguinte.',
  parametersJsonSchema: {
    type: 'object',
    description:
      'Parâmetros para obter a lista de contas a pagar do próximo mês.',
    properties: {
      message: {
        type: 'string',
        description: 'Gere uma mensagem amigável confirmando que está buscando as contas do próximo mês.',
      },
    },
    required: ['message'],
  },
}
