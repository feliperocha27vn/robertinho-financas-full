import { paidingAllUnpaidCurrentMonth } from '../../expenses/paiding-all-unpaid-current-month'

export async function handlePaidingAllUnpaidCurrentMonth(args: Record<string, any> | undefined) {
  const message = args?.message as string

  try {
    const { paidCount } = await paidingAllUnpaidCurrentMonth()

    if (paidCount === 0) {
      return {
        message:
          message ? `${message}\n\nVocê não tem contas pendentes para pagar neste mês! Todas já constam como pagas. 🎉` :
          `Você não tem contas pendentes para pagar neste mês! Todas já constam como pagas. 🎉`,
      }
    }

    return {
      message:
        message ? `${message}\n\n✅ **Tudo Quitado!**\n\nMaravilha! Dei baixa em ${paidCount} contas/parcelas pendentes deste mês. Você está com as finanças em dia! 🚀` :
        `✅ **Tudo Quitado!**\n\nMaravilha! Dei baixa em ${paidCount} contas/parcelas pendentes deste mês. Você está com as finanças em dia! 🚀`,
    }
  } catch (err: unknown) {
    const errorMessage =
      err && typeof err === 'object' && 'message' in err
        ? (err as { message?: string }).message
        : undefined

    return {
      message: `❌ **Erro ao Pagar Todas as Contas!**\n\n${errorMessage || 'Ocorreu um erro interno. Tente novamente mais tarde.'}`,
    }
  }
}
