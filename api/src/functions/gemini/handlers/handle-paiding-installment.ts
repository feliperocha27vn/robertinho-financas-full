import { paidingInstallment } from '../../expenses/paiding-installment'

export async function handlePaidingInstallment(args: Record<string, any> | undefined) {
  const name_expense = args?.name_expense as string
  const message = args?.message as string

  try {
    await paidingInstallment({ nameExpense: name_expense })

    return {
      message:
        message ? `${message}\n\n✅ Parcela Paga!\n\nA parcela da despesa "${name_expense}" foi registrada como paga com sucesso! 👌` :
        `✅ Parcela Paga!\n\nA parcela da despesa "${name_expense}" foi registrada como paga com sucesso! 👌`,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : null
    return {
      message: `❌ Erro ao Pagar Parcela!\n\n${errorMessage || 'Não foi possível marcar a parcela como paga.'}`,
    }
  }
}
