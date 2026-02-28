import type { Decimal } from '@prisma/client/runtime/library'
import { accountsPayableNextMonth } from '../../expenses/accounts-payable-next-month'

export async function handleAccountsPayableNextMonth(args: Record<string, any> | undefined) {
  const message = args?.message as string
  // Obtém lista e total das contas a pagar no próximo mês
  const payableResult = await accountsPayableNextMonth()
  const items = payableResult.accountsPayableNextMonth
  const totalAmountForPayableNextMonth =
    payableResult.totalAmountForPayableNextMonth

  const itemsText = items
    .map(
      (a: { description: string; amount: Decimal }) =>
        `🔹 **${a.description}**: ${Number(a.amount).toLocaleString('pt-BR', {
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
    message: message ? `${message}\n\n📅 **Contas a Pagar no Próximo Mês**\n\n${itemsText}\n\n💰 **Total Estimado:** ${formattedTotal}` : `📅 **Contas a Pagar no Próximo Mês**\n\n${itemsText}\n\n💰 **Total Estimado:** ${formattedTotal}`,
  }
}
