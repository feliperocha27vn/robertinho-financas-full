import { gemini } from '../../lib/google-gen-ai'
import { accountsPayableNextMonthDeclaration } from '../expenses/gemini/declaration-accounts-payable-next-month'
import { createExpenseDeclaration } from '../expenses/gemini/declarations/create-expense'
import { createExpenseInstallmentDeclaration } from '../expenses/gemini/declarations/create-expense-installment'
import { getRemainingInstallmentsDeclaration } from '../expenses/gemini/declarations/declaration-get-remaining-installments'
import { getSumExpensesOfMonthVariablesDeclaration } from '../expenses/gemini/declarations/declaration-get-sum-expenes-of-month-variables'
import { getSumExpensesDeclaration } from '../expenses/gemini/declarations/declaration-get-sum-expense'
import { getSumExpensesFixedDeclaration } from '../expenses/gemini/declarations/declaration-get-sum-expenses-fixed'
import { getSumExpensesOfLastMonthVariablesDeclaration } from '../expenses/gemini/declarations/declaration-get-sum-expenses-of-last-month-variables'
import { paidingAllUnpaidCurrentMonthDeclaration } from '../expenses/gemini/declarations/declaration-paiding-all-unpaid-current-month'
import { paidingInstallmentDeclaration } from '../expenses/gemini/declarations/declaration-paiding-installment'
import { getUnpaidExpensesOfCurrentMonthDeclaration } from '../expenses/gemini/declarations/declaration-unpaid-expenses-of-current-month'
import { createNewRecipeDeclaration } from '../recipes/declarations/declaration-create-new-recipe'

import { handleAccountsPayableNextMonth } from './handlers/handle-accounts-payable-next-month'
import { handleCreateExpense } from './handlers/handle-create-expense'
import { handleCreateExpenseInstallment } from './handlers/handle-create-expense-installment'
import { handleCreateNewRecipe } from './handlers/handle-create-new-recipe'
import { handleGetRemainingInstallments } from './handlers/handle-get-remaining-installments'
import { handleGetSumExpenses } from './handlers/handle-get-sum-expenses'
import { handleGetSumExpensesFixed } from './handlers/handle-get-sum-expenses-fixed'
import { handleGetSumExpensesOfLastMonthVariables } from './handlers/handle-get-sum-expenses-of-last-month-variables'
import { handleGetSumExpensesOfMonthVariables } from './handlers/handle-get-sum-expenses-of-month-variables'
import { handleGetUnpaidExpensesOfCurrentMonth } from './handlers/handle-get-unpaid-expenses-of-current-month'
import { handlePaidingAllUnpaidCurrentMonth } from './handlers/handle-paiding-all-unpaid-current-month'
import { handlePaidingInstallment } from './handlers/handle-paiding-installment'

type ConversationContent = { role: 'user' | 'model'; parts: { text: string }[] }

// Armazena o histórico em memória (chave = número de telefone)
const conversations = new Map<string, ConversationContent[]>()

export async function robertinhoDeFinancas(userInput: string, phone: string = 'default') {
  if (!conversations.has(phone)) {
    conversations.set(phone, [])
  }
  const history = conversations.get(phone)!

  // Adiciona a nova mensagem do usuário no final do histórico
  history.push({ role: 'user', parts: [{ text: userInput }] })

  // Mantém apenas as últimas 30 interações para contexto
  if (history.length > 30) {
    history.splice(0, history.length - 30)
  }

  const response = await gemini.models.generateContent({
    model: 'gemini-3.1-flash-lite-preview',
    contents: history,
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
                          1. Descrever uma despesa que fez normal ou cartão de crédito - use create_expense
                          2. Descrever uma compra parcelada - use create_expense_installment (pergunte a data da primeira parcela)
                          3. Perguntar sobre o total das despesas (todas) - use get_sum_expenses
                          4. Perguntar sobre o total das despesas fixas - use get_sum_expenses_fixed
                          5. Perguntar sobre o total das despesas variáveis do mês atual - use get_sum_expenses_of_month_variables
                          6. Perguntar sobre o total das despesas variáveis do mês passado - use get_sum_expenses_of_last_month_variables
                          7. Descrever uma receita/entrada de dinheiro - use create_new_recipe
                          8. Perguntar quais contas tem para pagar no próximo mês - use accounts_payable_next_month
                          9. Perguntar quais contas tem para pagar neste mês (em aberto/pendentes) - use get_unpaid_expenses_of_current_month
                          10. Perguntar quantas parcelas faltam para pagar de uma compra - use get_remaining_installments
                          11. Informar que pagou/quitou a parcela de UMA compra específica - use paiding_installment
                          12. Informar que pagou TODAS as despesas abertas ou afirmar "já paguei tudo / todas as despesas" deste mês - use paiding_all_unpaid_current_month
                          
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
                          
                          Para consultas de total e contas a pagar:
                          1. Chamar a função get_sum_expenses para o total geral
                          2. Chamar a função get_sum_expenses_fixed para total das despesas fixas
                          3. Chamar a função get_sum_expenses_of_month_variables para total de variáveis do mês corrente
                          4. Chamar a função get_sum_expenses_of_last_month_variables para total de variáveis do mês passado
                          5. Chamar accounts_payable_next_month quando o usuário quiser saber o que precisa pagar no mês que vem
                          6. Chamar get_unpaid_expenses_of_current_month quando quiser saber o que falta pagar ou o que tem para pagar neste mês atual
                          7. Chamar get_remaining_installments ao perguntar quantas parcelas faltam
                          8. Apresentar o valor/lista de forma amigável
                          
                          Para pagamento de contas:
                          1. Chamar a função paiding_installment quando o usuário disser que pagou a parcela de algo específico. Extrair o nome da conta falada e chamar a função.
                          2. Chamar a função paiding_all_unpaid_current_month quando o usuário disser que pagou "tudo", "todas as despesas" ou "as contas" referentes a pendências do mês.

                          REGRAS DE FORMATAÇÃO CRÍTICAS:
                          - NUNCA use formatação Markdown (como ** para negrito ou * para itálico).
                          - Use apenas texto puro e emojis. 
                          - Se precisar destacar algo, use apenas letras MAIÚSCULAS ou emojis.
                          - Responda apenas com o texto que deve ser exibido diretamente na tela do celular.
                          
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
                          
                          REGRA DE OURO CRÍTICA:
                          1. Você NUNCA deve confirmar que uma despesa ou receita foi salva se não tiver chamado a ferramenta correspondente (create_expense, create_expense_installment, create_new_recipe).
                          2. A chamada da ferramenta DEVE vir antes da sua confirmação de texto.
                          3. Se o usuário pedir algo que você não pode fazer ou se faltarem dados, peça os dados em vez de fingir que salvou.
                          4. Em funções de consulta (como get_unpaid_expenses), use APENAS os dados que retornarem da ferramenta. Não invente itens extras.
                          
                          Seja sempre positivo e ajude o usuário a ter controle sobre suas finanças!`,
      tools: [
        {
          functionDeclarations: [
            createExpenseDeclaration,
            accountsPayableNextMonthDeclaration,
            getUnpaidExpensesOfCurrentMonthDeclaration,
            getSumExpensesOfMonthVariablesDeclaration,
            getSumExpensesOfLastMonthVariablesDeclaration,
            getSumExpensesDeclaration,
            getSumExpensesFixedDeclaration,
            createNewRecipeDeclaration,
            createExpenseInstallmentDeclaration,
            getRemainingInstallmentsDeclaration,
            paidingInstallmentDeclaration,
            paidingAllUnpaidCurrentMonthDeclaration,
          ],
        },
      ],
    },
  })

  const functionCall = response.functionCalls?.[0]

  console.log(`💬 Conversa (${phone}): ${userInput}`)
  if (functionCall) {
    console.log(`🛠️ Gemini solicitou chamada de função: ${functionCall.name}`, functionCall.args)
  }

  let finalMessage = ''

  if (functionCall) {
    switch (functionCall.name) {
      case 'create_expense':
        finalMessage = (await handleCreateExpense(functionCall.args)).message
        break
      case 'get_sum_expenses':
        finalMessage = (await handleGetSumExpenses(functionCall.args)).message
        break
      case 'get_sum_expenses_fixed':
        finalMessage = (await handleGetSumExpensesFixed(functionCall.args)).message
        break
      case 'get_sum_expenses_of_month_variables':
        finalMessage = (await handleGetSumExpensesOfMonthVariables(functionCall.args)).message
        break
      case 'get_sum_expenses_of_last_month_variables':
        finalMessage = (await handleGetSumExpensesOfLastMonthVariables(functionCall.args)).message
        break
      case 'accounts_payable_next_month':
        finalMessage = (await handleAccountsPayableNextMonth(functionCall.args)).message
        break
      case 'get_unpaid_expenses_of_current_month':
        finalMessage = (await handleGetUnpaidExpensesOfCurrentMonth(functionCall.args)).message
        break
      case 'create_new_recipe':
        finalMessage = (await handleCreateNewRecipe(functionCall.args)).message
        break
      case 'get_remaining_installments':
        finalMessage = (await handleGetRemainingInstallments(functionCall.args)).message
        break
      case 'paiding_installment':
        finalMessage = (await handlePaidingInstallment(functionCall.args)).message
        break
      case 'paiding_all_unpaid_current_month':
        finalMessage = (await handlePaidingAllUnpaidCurrentMonth(functionCall.args)).message
        break
      case 'create_expense_installment':
        finalMessage = (await handleCreateExpenseInstallment(functionCall.args)).message
        break
      default:
        console.warn(`Unrecognized function call: ${functionCall.name}`)
        finalMessage = 'Desculpe, eu não entendi qual ação realizar.'
    }
  } else {
    // Extrai apenas as partes de texto da resposta
    const textParts = response.candidates?.[0]?.content?.parts
      ?.filter(part => 'text' in part && part.text)
      .map(part => part.text)
      .join(' ')

    if (textParts) {
      finalMessage = textParts
    } else {
      // Se chegou até aqui, logamos tudo o que o Gemini retornou para debugar.
      console.error('Gemini retornou um conteúdo inesperado ou vazio:')
      console.error(JSON.stringify(response.candidates?.[0], null, 2))
      finalMessage = 'Desculpe, eu não entendi o que você quis dizer ou me confundi com a sua solicitação. Pode repetir de outra forma?'
    }
  }

  // Adiciona a resposta final no histórico para dar contexto ao modelo na próxima mensagem
  history.push({ role: 'model', parts: [{ text: finalMessage }] })

  return { message: finalMessage }
}
