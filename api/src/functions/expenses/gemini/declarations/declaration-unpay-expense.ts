export const unpayExpenseDeclaration = {
  name: 'unpay_expense',
  description:
    'Desmarca uma despesa como paga, voltando-a para o estado de "pendente" ou "em aberto". Use esta função quando o usuário disser que se enganou, que ainda não pagou algo, ou que quer corrigir o status de pagamento de uma conta (ex: "ainda não paguei a luz", "marquei o aluguel como pago por engano"). A função busca a despesa pelo nome informado no parâmetro `name_expense`.',
  parametersJsonSchema: {
    type: 'object',
    description: 'Parâmetros para desmarcar uma despesa como paga.',
    properties: {
      name_expense: {
        type: 'string',
        description:
          'Uma substring curta e MUITO EXCLUSIVA da despesa para busca parcial no banco de dados. Extraia APENAS a palavra-chave principal. Se o usuário disser "ainda não paguei o financiamento da moto", use apenas "moto". Se disser "conta de energia", use "energia". Evite artigos, preposições ou nomes genéricos longos.',
      },
    },
    required: ['name_expense'],
  },
}
