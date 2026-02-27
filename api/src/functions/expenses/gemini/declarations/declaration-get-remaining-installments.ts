export const getRemainingInstallmentsDeclaration = {
  name: 'get_remaining_installments',
  description:
    'Busca e retorna o número de parcelas restantes (não pagas) para uma despesa específica informada pelo usuário. O valor retornado no parâmetro `name_expense` deve ser uma substring representativa da descrição no banco para permitir busca parcial (por exemplo "mouse rapoo" para uma despesa armazenada como "Mouse Rapoo modelo X"). A função também retornará o valor total restante (soma das parcelas não pagas) no campo `totalRemaining` (ex: 250.5) e o valor de cada parcela no campo `valueInstallmentOfExpense` (ex: 125.25). Use esses campos para exibir ao usuário o total restante e o valor aproximado de cada parcela.',
  parametersJsonSchema: {
    type: 'object',
    description:
      'Parâmetros para consultar o número de parcelas restantes de uma despesa.',
    properties: {
      name_expense: {
        type: 'string',
        description:
          'Uma substring curta e MUITO EXCLUSIVA da despesa para busca parcial no banco de dados. Extraia APENAS a palavra-chave principal do item. Se o usuário disser "quantas parcelas faltam do projetor da sala", retorne "projetor". Evite palavras genéricas ou verbos (não use "celular samsung pago do cartao", use apenas "samsung").',
      },
    },
    required: ['name_expense'],
  },
}
