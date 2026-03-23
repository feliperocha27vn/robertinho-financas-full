import { describe, expect, it } from 'vitest'
import { MessageFormatter } from '../../../src/presenters/message-formatter'

describe('MessageFormatter', () => {
  it('formats create expense success with rich text', () => {
    const message = MessageFormatter.createExpenseSuccess({
      description: 'Ifood <premium>',
      amount: 150,
      category: 'OTHERS',
      createdAt: new Date('2026-03-22T12:00:00.000Z'),
      isFixed: false,
      monthPartialTotal: 850,
    })

    expect(message).toContain('✅ <b>Despesa Registrada com Sucesso!</b>')
    expect(message).toContain('🧾 <i>Ifood &lt;premium&gt;</i>')
    expect(message).toContain('🏷️ <b>Categoria:</b> Outros')
    expect(message).toContain('💰 <b>Valor:</b> R$')
    expect(message).toContain('📅 <b>Data:</b>')
    expect(message).toContain('📊 <b>Total parcial do mes:</b> R$')
  })

  it('formats monthly summary dashboard style', () => {
    const message = MessageFormatter.monthlySummary({
      referenceDate: new Date('2026-03-10T00:00:00.000Z'),
      fixedExpenses: 1200,
      variableExpenses: 850,
      overallTotal: 2050,
    })

    expect(message).toContain('📊 <b>Resumo de')
    expect(message).toContain('🔴 <b>Despesas Fixas:</b> R$')
    expect(message).toContain('🟡 <b>Despesas Variaveis:</b> R$')
    expect(message).toContain('📉 <b>TOTAL GASTO:</b> R$')
  })

  it('formats total-with-items list', () => {
    const message = MessageFormatter.totalWithItems({
      title: 'Despesas Fixas',
      emoji: '🔴',
      totalLabel: 'Total de despesas fixas',
      totalAmount: 2000,
      items: [
        { description: 'Aluguel', amount: 1500 },
        { description: 'Internet', amount: 120 },
      ],
    })

    expect(message).toContain('🔴 <b>Despesas Fixas</b>')
    expect(message).toContain('💰 <b>Total de despesas fixas:</b> R$')
    expect(message).toContain('• Aluguel')
  })

  it('formats next month payable dashboard with details', () => {
    const message = MessageFormatter.accountsPayableNextMonth({
      referenceDate: new Date('2026-04-01T00:00:00.000Z'),
      items: [
        { description: 'Energia', amount: 130 },
        { description: 'Internet', amount: 99.9 },
      ],
      totalAmount: 229.9,
    })

    expect(message).toContain('📅 <b>Contas para')
    expect(message).toContain('🧾 <b>Quantidade de contas:</b> 2')
    expect(message).toContain('💰 <b>Total previsto:</b> R$')
    expect(message).toContain('• Energia')
    expect(message).toContain('• Internet')
  })
})
