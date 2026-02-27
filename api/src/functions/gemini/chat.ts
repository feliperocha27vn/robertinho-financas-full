import type { Decimal } from '@prisma/client/runtime/library'
import { gemini } from '../../lib/google-gen-ai'
import { accountsPayableNextMonth } from '../expenses/accounts-payable-next-month'
import { createExpense } from '../expenses/create-new-expense'
import { createExpenseInstallment } from '../expenses/create-new-expense-installment'
import { accountsPayableNextMonthDeclaration } from '../expenses/gemini/declaration-accounts-payable-next-month'
import { createExpenseDeclaration } from '../expenses/gemini/declarations/create-expense'
import { createExpenseInstallmentDeclaration } from '../expenses/gemini/declarations/create-expense-installment'
import { getRemainingInstallmentsDeclaration } from '../expenses/gemini/declarations/declaration-get-remaining-installments'
import { getSumExpensesOfMonthVariablesDeclaration } from '../expenses/gemini/declarations/declaration-get-sum-expenes-of-month-variables'
import { getSumExpensesDeclaration } from '../expenses/gemini/declarations/declaration-get-sum-expense'
import { getSumExpensesFixedDeclaration } from '../expenses/gemini/declarations/declaration-get-sum-expenses-fixed'
import { paidingInstallmentDeclaration } from '../expenses/gemini/declarations/declaration-paiding-installment'
import { getRemainingInstallments } from '../expenses/get-remaining-installments'
import { getSumExpensesOfMonthVariables } from '../expenses/get-sum-expenes-of-month-variables'
import { getSumExpenses } from '../expenses/get-sum-expenses'
import { getSumExpensesFixed } from '../expenses/get-sum-expenses-fixed'
import { paidingInstallment } from '../expenses/paiding-installment'
import { createNewRecipe } from '../recipes/create-new-recipe'
import { createNewRecipeDeclaration } from '../recipes/declarations/declaration-create-new-recipe'

export async function robertinhoDeFinancas(userInput: string) {
  const response = await gemini.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: userInput,
    config: {
      systemInstruction: `Você é o Robertinho Finanças, um assistente financeiro amigável e prestativo que ajuda usuários a registrar suas despesas em português do Brasil.

                          INFORMAÇÃO DE CONTEXTO IMPORTANTE:
                          - Data atual de hoje: ${new Date().toLocaleDateString('pt-BR')}
                          - Considere o ano atual da data de hoje para qualquer cálculo ou presunção de data (ex: se o usuário disser "março", é o "março" deste ano ou do próximo dependendo da data atual).

                          Sua personalidade:
                          - Simpático e encorajador
                          - Usa linguagem casual e acessível
                          - Pode usar emojis quando apropriado
                          - Sempre confirma os detalhes de forma clara

                          O usuário pode:
                          1. Descrever uma despesa que fez - use create_expense
                          2. Descrever uma compra parcelada - use create_expense_installment (pergunte a data da primeira parcela)
                          3. Perguntar sobre o total das despesas - use get_sum_expenses
                          4. Perguntar sobre o total das despesas fixas - use get_sum_expenses_fixed
                          5. Descrever uma receita/entrada de dinheiro - use create_new_recipe
                          
                          Para despesas novas:
                          1. Extrair a descrição clara do que foi gasto
                          2. Identificar o valor em reais (convertendo palavras para números se necessário)
                          3. Categorizar apropriadamente
                          4. Identificar se é despesa fixa (recorrente) ou variável
                          5. Verificar se é parcelada e quantas parcelas
                          6. Chamar a função create_expense para salvar no banco
                          7. Responder com uma mensagem amigável confirmando o registro
                          
                          Para receitas/entradas:
                          1. Extrair a descrição da origem do dinheiro
                          2. Identificar o valor em reais
                          3. Chamar a função create_new_recipe para salvar no banco
                          4. Responder com uma mensagem amigável confirmando o registro
                          
                          Para compras parceladas:
                          1. Extrair a descrição da compra e valor total
                          2. Identificar o número de parcelas
                          3. Perguntar ao usuário qual é a data da primeira parcela
                          4. Usar a data informada para calcular as próximas parcelas (mensalmente)
                          5. Chamar a função create_expense_installment para salvar
                          6. Confirmar com detalhes da compra parcelada
                          
                          Para consultas de total:
                          1. Chamar a função get_sum_expenses para total geral
                          2. Chamar a função get_sum_expenses_fixed para total das despesas fixas
                          3. Apresentar o valor total de forma amigável

                          Exemplos do seu tom de resposta:
                          Para despesas:
                          - "Beleza! 👍 Registrei seu Uber de R$ 50,00 nas despesas de transporte!"
                          - "Anotado! 📝 Aluguel de R$ 1.200,00 registrado nas despesas de moradia."
                          - "Pronto! ✅ Seu livro de R$ 80,00 foi adicionado aos gastos com estudos."
                          - "Show! 💰 Fatura do cartão de R$ 350,00 registrada nos créditos."
                          
                          Para receitas:
                          - "✅ Receita registrada! Salário de R$ 3.500,00 foi adicionada às suas entradas! 💰"
                          - "Ótimo! 🎉 Venda do PS5 de R$ 1.200,00 registrada como receita!"
                          - "Perfeito! ✅ Reembolso de R$ 150,00 adicionado às suas entradas! 💚"
                          
                          Para compras parceladas:
                          - "📱 Celular registrado! R$ 2.400,00 em 12x, primeira parcela em 15/11/2025!"
                          - "💳 Compra parcelada anotada! Notebook de R$ 3.500,00 em 10 vezes, vencendo primeira em 01/12/2025."
                          
                          Para consultas de total:
                          - "💰 Suas despesas somam R$ 1.250,00 no total!"
                          - "🏠 Total das suas despesas fixas: R$ 850,50. Continue controlando suas finanças!"
                          - "🧮 Calculei aqui: você já gastou R$ 2.100,00 ao todo."

                          Se o usuário fizer perguntas gerais (como seu nome ou outras dúvidas), responda de forma amigável sem chamar a função.
                          
                          Seja sempre positivo e ajude o usuário a ter controle sobre suas finanças!`,
      tools: [
        {
          functionDeclarations: [
            createExpenseDeclaration,
            accountsPayableNextMonthDeclaration,
            getSumExpensesOfMonthVariablesDeclaration,
            getSumExpensesDeclaration,
            getSumExpensesFixedDeclaration,
            createNewRecipeDeclaration,
            createExpenseInstallmentDeclaration,
            getRemainingInstallmentsDeclaration,
            paidingInstallmentDeclaration,
          ],
        },
      ],
    },
  })

  const functionCall = response.functionCalls?.[0]

  if (functionCall?.name === 'create_expense') {
    const description = functionCall.args?.description as string
    const amount = functionCall.args?.amount as number
    const category = functionCall.args?.category as
      | 'TRANSPORT'
      | 'OTHERS'
      | 'STUDIES'
      | 'RESIDENCE'
      | 'CREDIT'
    const message = functionCall.args?.message as string
    const isFixed = functionCall.args?.isFixed as boolean | undefined

    // Executa a função que a IA pediu para chamar
    await createExpense({
      description,
      amount,
      category,
      isFixed,
    })

    const formattedAmount = amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })

    const categoryLabels: Record<string, string> = {
      TRANSPORT: 'transporte',
      OTHERS: 'outros',
      STUDIES: 'estudos',
      RESIDENCE: 'moradia',
      CREDIT: 'créditos',
    }

    const categoryLabel =
      categoryLabels[category] ?? category?.toLowerCase() ?? 'outra'

    if (isFixed) {
      return {
        message:
          message ||
          `✅ Registrado: ${formattedAmount} — ${description} (fixa)`,
      }
    }

    return {
      message:
        message || `✅ Registrado: ${formattedAmount} — ${categoryLabel}`,
    }
  }

  if (functionCall?.name === 'get_sum_expenses') {
    const message = functionCall.args?.message as string

    // Executa a função para obter o total das despesas e a lista
    const { totalExpenses, items } = await getSumExpenses()
    const formattedTotal = Number(totalExpenses).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })

    if (items && items.length > 0) {
      const itemsList = items.map(item => {
        const itemAmount = Number(item.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        const installmentInfo = item.numberOfInstallments && item.numberOfInstallments > 1
          ? ` (Parcelado em ${item.numberOfInstallments}x)`
          : ''
        return `• ${item.description}: ${itemAmount}${installmentInfo}`
      }).join('\n')

      return {
        message: `Aqui estão os detalhes das suas despesas:\n\n${itemsList}\n\n💰 *Total Geral:* ${formattedTotal}`,
      }
    }

    return {
      message: message || `💰 Total das suas despesas: ${formattedTotal}`,
    }
  }

  if (functionCall?.name === 'get_sum_expenses_fixed') {
    // Executa a função para obter o total das despesas fixas
    const { totalFixedExpenses } = await getSumExpensesFixed()
    const formattedTotal = Number(totalFixedExpenses).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })

    return {
      message: `🏠 Total das suas despesas fixas: ${formattedTotal}`,
    }
  }

  if (functionCall?.name === 'get_sum_expenses_of_month_variables') {
    // Executa a função para obter o total das despesas variáveis do mês corrente
    const message = functionCall.args?.message as string

    const { totalExpensesOfMonth } = await getSumExpensesOfMonthVariables()
    const formattedTotal = Number(totalExpensesOfMonth).toLocaleString(
      'pt-BR',
      {
        style: 'currency',
        currency: 'BRL',
      }
    )

    return {
      message:
        message ||
        `💰 Total das suas despesas variáveis deste mês: ${formattedTotal}`,
    }
  }

  if (functionCall?.name === 'accounts_payable_next_month') {
    // Obtém lista e total das contas a pagar no próximo mês
    const payableResult = await accountsPayableNextMonth()
    const items = payableResult.accountsPayableNextMonth
    const totalAmountForPayableNextMonth =
      payableResult.totalAmountForPayableNextMonth

    const itemsText = items
      .map(
        (a: { description: string; amount: Decimal }) =>
          `• ${a.description}: ${Number(a.amount).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })}`
      )
      .join('\n')

    const formattedTotal = Number(
      totalAmountForPayableNextMonth
    ).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })

    return {
      message: `*Contas a pagar no próximo mês:*\n\n${itemsText}\n\n*Total: ${formattedTotal}*`,
    }
  }

  if (functionCall?.name === 'create_new_recipe') {
    const description = functionCall.args?.description as string
    const amount = functionCall.args?.amount as number

    // Executa a função que a IA pediu para chamar
    await createNewRecipe({
      description,
      amount,
    })

    const formattedAmount = amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })

    return {
      message: `✅ Receita registrada! ${description} no valor de ${formattedAmount} foi adicionada às suas entradas! 💰`,
    }
  }

  if (functionCall?.name === 'get_remaining_installments') {
    const name_expense = functionCall.args?.name_expense as string

    // Executa a função que busca as parcelas restantes
    const {
      remainingInstallments,
      found,
      expenseDescription,
      totalRemaining,
      valueInstallmentOfExpense,
    } = await getRemainingInstallments({
      nameExpense: name_expense,
    })

    if (!found) {
      return {
        message: `❌ Não encontrei nenhuma despesa parecida com "${name_expense}". Tente usar parte do nome ou outra palavra-chave (ex: "mouse rapoo").`,
      }
    }

    const formattedTotal = totalRemaining
      ? Number(totalRemaining).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        })
      : undefined

    const formattedPerInstallment = valueInstallmentOfExpense
      ? Number(valueInstallmentOfExpense).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        })
      : undefined

    return {
      message: `🔎 Encontrei ${remainingInstallments} parcela(s) não paga(s) para "${expenseDescription}"${
        formattedPerInstallment
          ? `, cada parcela ~ ${formattedPerInstallment}`
          : ''
      }${formattedTotal ? `, total restante ${formattedTotal}` : ''}.`,
    }
  }

  if (functionCall?.name === 'paiding_installment') {
    const name_expense = functionCall.args?.name_expense as string
    const message = functionCall.args?.message as string

    try {
      await paidingInstallment({ nameExpense: name_expense })

      return {
        message:
          message ||
          `✅ Parcela da despesa "${name_expense}" marcada como paga! 👌`,
      }
    } catch (err: unknown) {
      const errorMessage =
        err && typeof err === 'object' && 'message' in err
          ? (err as { message?: string }).message
          : undefined

      return {
        message:
          errorMessage || '❌ Não foi possível marcar a parcela como paga.',
      }
    }
  }

  if (functionCall?.name === 'create_expense_installment') {
    const description = functionCall.args?.description as string
    const amount = functionCall.args?.amount as number
    const category = functionCall.args?.category as 'CREDIT' | 'OTHERS'
    const numberOfInstallments = functionCall.args
      ?.numberOfInstallments as number
    const firstDueDateString = functionCall.args?.firstDueDate as string
    const message = functionCall.args?.message as string

    // Converte a string da data para Date
    const firstDueDate = new Date(firstDueDateString)

    // Executa a função que a IA pediu para chamar
    await createExpenseInstallment({
      description,
      amount,
      category,
      numberOfInstallments,
      firstDueDate,
    })

    return {
      message:
        message ||
        `📱 Despesa parcelada criada! ${description} de R$ ${amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} em ${numberOfInstallments}x, primeira parcela em ${firstDueDate.toLocaleDateString('pt-BR')}!`,
    }
  }

  // Extrai apenas as partes de texto da resposta
  const textParts = response.candidates?.[0]?.content?.parts
    ?.filter(part => 'text' in part && part.text)
    .map(part => part.text)
    .join(' ')

  if (textParts) {
    return {
      message: textParts,
    }
  }

  // Se chegou até aqui, logamos tudo o que o Gemini retornou para debugar.
  console.error('Gemini retornou um conteúdo inesperado ou vazio:')
  console.error(JSON.stringify(response.candidates?.[0], null, 2))

  return {
    message: 'Desculpe, eu não entendi o que você quis dizer ou me confundi com a sua solicitação. Pode repetir de outra forma?',
  }
}
