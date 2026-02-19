export const paidingInstallmentDeclaration = {
  name: 'paiding_installment',
  description:
    'Marca a próxima parcela pendente de uma despesa específica como paga. A função localiza a despesa pelo nome e atualiza a parcela mais antiga que ainda não foi paga.',
  parametersJsonSchema: {
    type: 'object',
    description: 'Parâmetros para marcar uma parcela de despesa como paga.',
    properties: {
      name_expense: {
        type: 'string',
        description:
          'O nome da despesa que o usuário deseja pagar a parcela. Extraia o nome do item do texto do usuário. Por exemplo, se o usuário disser "paguei a fatura do meu notebook", o valor deve ser "notebook".',
      },
      message: {
        type: 'string',
        description:
          'Gere uma mensagem curta e amigável confirmando que a parcela foi marcada como paga. Use emojis para um tom mais simpático. Exemplo: "Prontinho! 👍 Parcela paga com sucesso.", "Ok, já marquei como pago! ✅"',
      },
    },
    required: ['name_expense', 'message'],
  },
}
