import { Type } from '@google/genai'
import {
  declarationCalendar,
  declarationListCalendarEvents,
} from '../../../../functions/calendar/gemini/declarations/calendar-tools'

export const declarationGetRemainingInstallments = {
  name: 'get_remaining_installments',
  description:
    'Retorna quantas parcelas faltam para uma despesa especifica, com total restante.',
  parametersJsonSchema: {
    type: Type.OBJECT,
    properties: {
      nameExpense: {
        type: Type.STRING,
        description: 'Nome da despesa para consultar parcelas restantes.',
      },
    },
    required: ['nameExpense'],
  },
}

export const declarationGetAllRemainingInstallments = {
  name: 'get_all_remaining_installments',
  description:
    'Lista todas as compras parceladas com parcelas restantes e total geral restante.',
  parametersJsonSchema: {
    type: Type.OBJECT,
    properties: {},
    required: [],
  },
}

export const declarationGetSumExpenses = {
  name: 'get_sum_expenses',
  description: 'Retorna o total geral de despesas e a lista completa de itens.',
  parametersJsonSchema: {
    type: Type.OBJECT,
    properties: {},
    required: [],
  },
}

export const declarationGetSumExpensesFixed = {
  name: 'get_sum_expenses_fixed',
  description: 'Retorna o total de despesas fixas e os itens correspondentes.',
  parametersJsonSchema: {
    type: Type.OBJECT,
    properties: {},
    required: [],
  },
}

export const declarationGetSumExpensesOfLastMonthVariables = {
  name: 'get_sum_expenses_of_last_month_variables',
  description:
    'Retorna o total de despesas variaveis do mes anterior e seus itens.',
  parametersJsonSchema: {
    type: Type.OBJECT,
    properties: {},
    required: [],
  },
}

export const declarationGetUnpaidExpensesOfCurrentMonth = {
  name: 'get_unpaid_expenses_of_current_month',
  description:
    'Retorna as despesas ainda nao pagas no mes atual e o total em aberto.',
  parametersJsonSchema: {
    type: Type.OBJECT,
    properties: {},
    required: [],
  },
}

export const declarationPayInstallment = {
  name: 'pay_installment',
  description:
    'Marca a proxima parcela em aberto de uma despesa como paga pelo nome.',
  parametersJsonSchema: {
    type: Type.OBJECT,
    properties: {
      nameExpense: {
        type: Type.STRING,
        description: 'Nome da despesa para baixar uma parcela.',
      },
    },
    required: ['nameExpense'],
  },
}

export const declarationPayAllUnpaidCurrentMonth = {
  name: 'pay_all_unpaid_current_month',
  description:
    'Marca todas as despesas em aberto do mes atual como pagas de uma vez.',
  parametersJsonSchema: {
    type: Type.OBJECT,
    properties: {},
    required: [],
  },
}

export const declarationUnpayExpense = {
  name: 'unpay_expense',
  description:
    'Desfaz o pagamento de uma despesa pelo nome (fixa ou parcelada).',
  parametersJsonSchema: {
    type: Type.OBJECT,
    properties: {
      nameExpense: {
        type: Type.STRING,
        description: 'Nome da despesa para desfazer pagamento.',
      },
    },
    required: ['nameExpense'],
  },
}

export const declarationAccountsToPayByDayFifteen = {
  name: 'accounts_to_pay_by_day_fifteen',
  description:
    'Retorna contas a pagar ate o dia 15 do mes atual e total previsto.',
  parametersJsonSchema: {
    type: Type.OBJECT,
    properties: {},
    required: [],
  },
}

export const declarationCreateRecipe = {
  name: 'create_recipe',
  description: 'Registra uma receita (entrada) no banco de dados.',
  parametersJsonSchema: {
    type: Type.OBJECT,
    properties: {
      description: { type: Type.STRING },
      amount: { type: Type.NUMBER },
    },
    required: ['description', 'amount'],
  },
}

export const declarationGetHomeData = {
  name: 'get_home_data',
  description:
    'Retorna dados consolidados da home: saldo, receita, despesa e transacoes recentes.',
  parametersJsonSchema: {
    type: Type.OBJECT,
    properties: {},
    required: [],
  },
}

export const declarationDeleteVariableExpenseByName = {
  name: 'delete_variable_expense_by_name',
  description:
    'Exclui despesa variavel avulsa do mes atual por nome, com suporte a desambiguacao por ID.',
  parametersJsonSchema: {
    type: Type.OBJECT,
    properties: {
      nameExpense: { type: Type.STRING },
      selectedExpenseId: { type: Type.STRING },
    },
    required: ['nameExpense'],
  },
}

export const declarationPreviewDeleteAllVariableExpensesCurrentMonth = {
  name: 'preview_delete_all_variable_expenses_current_month',
  description:
    'Retorna previa com quantidade e valor total das despesas variaveis avulsas do mes atual.',
  parametersJsonSchema: {
    type: Type.OBJECT,
    properties: {},
    required: [],
  },
}

export const declarationDeleteAllVariableExpensesCurrentMonth = {
  name: 'delete_all_variable_expenses_current_month',
  description:
    'Exclui todas as despesas variaveis avulsas do mes atual apos confirmacao do usuario.',
  parametersJsonSchema: {
    type: Type.OBJECT,
    properties: {},
    required: [],
  },
}

export const financeFunctionDeclarations = [
  {
    name: 'create_expense',
    description: 'Cria uma despesa avulsa no banco de dados.',
    parametersJsonSchema: {
      type: Type.OBJECT,
      properties: {
        description: { type: Type.STRING },
        amount: { type: Type.NUMBER },
        category: {
          type: Type.STRING,
          enum: ['TRANSPORT', 'OTHERS', 'STUDIES', 'RESIDENCE', 'CREDIT'],
        },
        isFixed: { type: Type.BOOLEAN },
      },
      required: ['description', 'amount', 'category'],
    },
  },
  {
    name: 'create_expense_installment',
    description:
      'Cria despesa parcelada no banco com numero de parcelas e primeira data de vencimento.',
    parametersJsonSchema: {
      type: Type.OBJECT,
      properties: {
        description: { type: Type.STRING },
        amount: { type: Type.NUMBER },
        category: {
          type: Type.STRING,
          enum: ['TRANSPORT', 'OTHERS', 'STUDIES', 'RESIDENCE', 'CREDIT'],
        },
        numberOfInstallments: { type: Type.INTEGER },
        firstDueDateIso: {
          type: Type.STRING,
          description: 'Data ISO absoluta. Exemplo: 2026-04-10T00:00:00.000Z',
        },
      },
      required: [
        'description',
        'amount',
        'category',
        'numberOfInstallments',
        'firstDueDateIso',
      ],
    },
  },
  {
    name: 'update_expense_amount',
    description: 'Atualiza o valor de uma despesa existente.',
    parametersJsonSchema: {
      type: Type.OBJECT,
      properties: {
        nameExpense: { type: Type.STRING },
        amount: { type: Type.NUMBER },
      },
      required: ['nameExpense', 'amount'],
    },
  },
  {
    name: 'pay_expenses_by_names',
    description:
      'Marca como pagas contas/despesas pelos nomes mencionados pelo usuario.',
    parametersJsonSchema: {
      type: Type.OBJECT,
      properties: {
        items: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
      required: ['items'],
    },
  },
  {
    name: 'accounts_payable_next_month',
    description:
      'Busca contas previstas para o proximo mes, com total e detalhamento.',
    parametersJsonSchema: {
      type: Type.OBJECT,
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_sum_expenses_of_month_variables',
    description: 'Retorna total de despesas variaveis do mes atual.',
    parametersJsonSchema: {
      type: Type.OBJECT,
      properties: {},
      required: [],
    },
  },
  declarationGetRemainingInstallments,
  declarationGetAllRemainingInstallments,
  declarationGetSumExpenses,
  declarationGetSumExpensesFixed,
  declarationGetSumExpensesOfLastMonthVariables,
  declarationGetUnpaidExpensesOfCurrentMonth,
  declarationPayInstallment,
  declarationPayAllUnpaidCurrentMonth,
  declarationUnpayExpense,
  declarationAccountsToPayByDayFifteen,
  declarationCreateRecipe,
  declarationGetHomeData,
  declarationDeleteVariableExpenseByName,
  declarationPreviewDeleteAllVariableExpensesCurrentMonth,
  declarationDeleteAllVariableExpensesCurrentMonth,
  declarationCalendar,
  declarationListCalendarEvents,
]
