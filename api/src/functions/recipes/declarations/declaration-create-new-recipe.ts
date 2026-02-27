export const createNewRecipeDeclaration = {
  name: 'create_new_recipe',
  description:
    'Registra uma nova receita (qualquer entrada de dinheiro, salário, lucro, pix recebido) fornecidos pelo usuário em linguagem natural.',
  parametersJsonSchema: {
    type: 'object',
    description: 'Parâmetros estritamente necessários para registrar uma nova receita financeira na conta do usuário.',
    properties: {
      description: {
        type: 'string',
        description:
          "Descrição curta e clara da origem do dinheiro. Extraia do texto do usuário ÚNICA E EXCLUSIVAMENTE a fonte da receita, sem incluir o valor numérico ou datas soltas no texto. Exemplos: 'Salário de Outubro', 'Venda do PS5', 'Pix do Joãozinho', 'Reembolso médico'.",
      },
      amount: {
        type: 'number',
        description:
          'MUITO IMPORTANTE: Valor TOTAL da receita depositada/recebida. Extraia APENAS o formato numérico. Se o usuário usar vírgulas, converta para ponto flutuante. Se informar "R$ 1.500,50" ou "mil e quinhentos reais e cinquenta centavos", retorne 1500.50. Nunca inclua textos ou cifrões (R$).',
      },
    },
    required: ['description', 'amount'],
    additionalProperties: false,
  },
}
