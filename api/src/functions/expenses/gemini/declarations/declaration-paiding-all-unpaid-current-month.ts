export const paidingAllUnpaidCurrentMonthDeclaration = {
  name: 'paiding_all_unpaid_current_month',
  description:
    'Marca todas as contas e parcelas pendentes do mês atual como pagas. Use esta função apenas quando o usuário afirmar claramente que pagou TODAS as despesas deste mês (Ex: "já paguei todas", "pode dar baixa em tudo deste mês"). Esta ação realiza o pagamento em lote de pendências e contorna a necessidade de pagá-las individualmente.',
  parametersJsonSchema: {
    type: 'object',
    description: 'Parâmetros para pagar todas as contas do mês.',
    properties: {
      message: {
        type: 'string',
        description:
          'Gere uma mensagem curta e amigável confirmando que entendeu o comando de pagar tudo. Exemplo: "Prontinho! 👍 Marquei tudo como pago.", "Maravilha! 🎉"',
      },
    },
    required: ['message'],
  },
}
