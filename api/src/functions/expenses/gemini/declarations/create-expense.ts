export const createExpenseDeclaration = {
  name: 'create_expense',
  description:
    'Cria uma nova despesa baseada na descrição em português fornecida pelo usuário. Após extrair os dados, responda de forma amigável e confirmando o registro.',
  parametersJsonSchema: {
    type: 'object',
    description: 'Parâmetros necessários para criar uma despesa',
    properties: {
      description: {
        type: 'string',
        description: `Descrição curta e clara da despesa. 
        Extraia ÚNICA E EXCLUSIVAMENTE o nome do item ou serviço gasto, sem verbos soltos ou textos extras.
        Exemplos de extração correta: "Uber", "Aluguel", "Livro", "Gasolina".
        Exemplos INCORRETOS: "Gastei com Uber", "Paguei o aluguel".`,
      },
      amount: {
        type: 'number',
        description: `Valor TOTAL da despesa gerada.
        Extraia APENAS o formato numérico. Se o usuário usar vírgulas, converta para ponto flutuante.
        Se informar "R$ 150,50" ou "cento e cinquenta reais e cinquenta centavos", retorne 150.50.
        Nunca inclua textos ou cifrões (R$).`,
      },
      category: {
        type: 'string',
        description: `Categoria da despesa. Analise o texto do usuário em português e escolha UMA das seguintes categorias:
        - TRANSPORT: transporte, combustível, uber, táxi, ônibus, metrô, estacionamento, veículo, moto, pedágio
        - STUDIES: estudos, educação, curso, faculdade, universidade, livros, material escolar, mensalidade
        - RESIDENCE: residência, moradia, aluguel, condomínio, água, luz, energia, internet, gás, IPTU, casa, apartamento
        - CREDIT: crédito, cartão de crédito, empréstimo, financiamento, dívida, parcela, prestação
        - OTHERS: outros, diversos, não especificado, qualquer coisa que não se encaixe nas categorias acima`,
        enum: ['TRANSPORT', 'OTHERS', 'STUDIES', 'RESIDENCE', 'CREDIT'],
      },
      message: {
        type: 'string',
        description: `Mensagem amigável e personalizada do Robertinho Finanças confirmando o registro da despesa.
        Seja simpático, use emojis se apropriado, e confirme os detalhes da despesa de forma natural.
        Exemplos:
        - "Beleza! 👍 Registrei seu Uber de R$ 50,00 nas despesas de transporte!"
        - "Anotado! 📝 Aluguel de R$ 1.200,00 registrado nas despesas de moradia."
        - "Pronto! ✅ Livro de R$ 80,00 adicionado aos gastos com estudos."`,
      },
      isFixed: {
        type: 'boolean',
        description: `Indica se a despesa é de natureza fixa/recorrente (como luz, água, internet, IPTU, aluguel, condomínio) ou variável (farmácia, lanche, ifood, uber, roupas). Retorne true para fixas e false para variáveis.`,
      },
    },
    required: ['description', 'amount', 'category', 'message', 'isFixed'],
    additionalProperties: false,
  },
}
