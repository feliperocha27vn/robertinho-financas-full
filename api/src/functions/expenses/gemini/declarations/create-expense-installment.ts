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
          'MUITO IMPORTANTE: Valor TOTAL da despesa (e não o valor de cada parcela). Se o usuário disser "comprei um celular de 2000 reais em 10x", o amount é 2000. Se disser "comprei uma TV em 12x de 100 reais", você deve multiplicar e enviar o amount como 1200. Retorne apenas o número, sem símbolos.',
      },
      category: {
        type: 'string',
        description:
          'A categoria da despesa. Escolha estritamente UMA opção: TRANSPORT (Uber, ônibus), STUDIES (livros, cursos), RESIDENCE (aluguel, água), CREDIT (faturas, parcelamentos gerais) ou OTHERS.',
        enum: ['TRANSPORT', 'OTHERS', 'STUDIES', 'RESIDENCE', 'CREDIT'],
      },
      numberOfInstallments: {
        type: 'number',
        description:
          'O número de vezes que a compra foi dividida (ex: se "parcelei em 10x", retorne 10). Se for uma compra à vista ou não informada, retorne 1.',
      },
      firstDueDate: {
        type: 'string',
        description:
          'Data de vencimento da primeira parcela (ou pagamento único) no formato ISO YYYY-MM-DDT00:00:00.000Z. Se o usuário disser "vence dia 10", calcule o próximo dia 10 disponível baseado na data atual. Se ele não informar nenhuma data específica para compras parceladas, assuma que a primeira parcela vence no mês seguinte ao atual.',
      },
      message: {
        type: 'string',
        description:
          'Gere uma mensagem amigável ao usuário. Exemplo: "📱 Celular registrado! R$ 2.400,00 dividos em 10x, com a primeira para pagar em 15/11/2025!"',
      },
    },
    required: ['description', 'amount', 'category', 'numberOfInstallments', 'firstDueDate', 'message'],
  },
}
