import { unpayExpense } from '../../expenses/unpay-expense'

export async function handleUnpayExpense(args: Record<string, any> | undefined) {
  const name_expense = args?.name_expense as string

  const { found, expenseDescription, alreadyUnpaid, success } = await unpayExpense({
    nameExpense: name_expense,
  })

  if (!found) {
    return {
      message: `😕 Não encontrei nenhuma despesa parecida com "${name_expense}" para ajustar o pagamento.`,
    }
  }

  if (alreadyUnpaid) {
    return {
      message: `ℹ️ A despesa "${expenseDescription}" já consta como não paga (pendente). Não precisei alterar nada!`,
    }
  }

  if (success) {
    return {
      message: `✅ Entendido! Reajustei aqui: a despesa "${expenseDescription}" agora volta a aparecer como PENDENTE.`,
    }
  }

  return {
    message: `❌ Ocorreu um erro ao tentar desmarcar o pagamento de "${expenseDescription}".`,
  }
}
