export const createNewRecipeDeclaration = {
  name: 'create_new_recipe',
  description:
    'Registra uma nova receita (entrada de dinheiro) com base na descrição e valor fornecidos pelo usuário em linguagem natural.',
  parametersJsonSchema: {
    type: 'object',
    description: 'Parâmetros necessários para registrar uma nova receita.',
    properties: {
      description: {
        type: 'string',
        description:
          "Descrição da origem da receita. Extraia do texto do usuário de onde o dinheiro veio. Exemplos: 'Salário de Outubro', 'Venda do PS5', 'Reembolso do médico'.",
      },
      amount: {
        type: 'number',
        description:
          'Valor da receita em reais (R$). Extraia o valor numérico mencionado pelo usuário. Se o usuário disser "dois mil reais", retorne 2000. Se disser "R$ 450,80", retorne 450.80. Retorne apenas o número.',
      },
    },
    required: ['description', 'amount'],
    additionalProperties: false,
  },
}
