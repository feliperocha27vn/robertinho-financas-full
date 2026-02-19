import api from '../lib/axios'

interface GetAccountPayableNextMonthReply {
  totalAmountForPayByDayFifteen: number
}

export async function getAccountPayableNextMonth(): Promise<GetAccountPayableNextMonthReply> {
  const response = await api.get<GetAccountPayableNextMonthReply>(
    '/expenses/accounts-payable-by-day-fifteen'
  )

  return response.data
}
