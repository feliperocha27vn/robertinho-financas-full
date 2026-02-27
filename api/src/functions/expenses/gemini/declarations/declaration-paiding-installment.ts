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
          'O nome da despesa que o usuário deseja marcar a parcela como gapa. Extraia APENAS a palavra-chave principal do item. Ex: se o usuário disser "paguei a fatura do notebook novo", o valor deve ser estritamente "notebook". Se disser "já paguei a TV de 60 polegadas", retorne "TV".',
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
