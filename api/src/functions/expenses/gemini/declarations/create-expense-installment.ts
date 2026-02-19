export const createExpenseInstallmentDeclaration = {
  name: 'create_expense_installment',
  description:
    'Cria uma nova despesa, que pode ser uma compra única ou parcelada. Se for parcelada, gera os registros de cada parcela com suas respectivas datas de vencimento.',
  parametersJsonSchema: {
    type: 'object',
    description:
      'Parâmetros para registrar uma nova despesa, seja ela única ou parcelada.',
    properties: {
      description: {
        type: 'string',
        description:
          'Descrição clara e concisa da despesa. Extraia do texto do usuário o item ou serviço adquirido. Exemplos: "Tênis de corrida novo", "Conta de internet mensal", "Jantar com amigos".',
      },
      amount: {
        type: 'number',
        description:
          'Valor total da despesa. Extraia o valor numérico mencionado pelo usuário. Se o usuário disser "trezentos e cinquenta reais", retorne 350. Retorne apenas o número, sem símbolos de moeda.',
      },
      category: {
        type: 'string',
        description:
          'A categoria da despesa. Analise o texto do usuário e escolha UMA das seguintes opções: - TRANSPORT: para Uber, combustível, passagem de ônibus. - STUDIES: para livros, cursos, mensalidades. - RESIDENCE: para aluguel, água, luz. - CREDIT: para faturas de cartão de crédito, empréstimos. - OTHERS: para outras despesas não listadas.',
        enum: ['TRANSPORT', 'OTHERS', 'STUDIES', 'RESIDENCE', 'CREDIT'],
      },
      numberOfInstallments: {
        type: 'number',
        description:
          'O número total de parcelas da compra. É um campo opcional. Se o usuário mencionar um parcelamento (ex: "comprei em 3 vezes", "parcelei em 10x"), extraia esse número. Se for um pagamento único ou não mencionado, omita este campo.',
      },
      firstDueDate: {
        type: 'string',
        description:
          'A data de vencimento da primeira parcela, no formato AAAA-MM-DD. É um campo opcional. Se o usuário especificar uma data de início para os pagamentos (ex: "a primeira parcela vence dia 10 do mês que vem"), infira a data. Se não for especificado, o sistema usará a data atual como base.',
      },
      message: {
        type: 'string',
        description:
          'Gere uma mensagem amigável e personalizada confirmando o registro da despesa. Mencione a descrição, o valor total e o número de parcelas, se aplicável. Use emojis apropriados. Exemplos: "Prontinho! Registrei seu tênis novo de R$ 350,00. 👟", "Ok! Agendei a conta de internet de R$ 99,00 em 12 parcelas. ✅"',
      },
    },
    required: ['description', 'amount', 'category', 'message'],
  },
}
