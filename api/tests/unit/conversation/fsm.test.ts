import { describe, expect, it } from 'vitest'
import { FiniteStateMachine } from '../../../src/conversation/fsm'

describe('FiniteStateMachine', () => {
  it('changes state when transition condition matches', () => {
    const fsm = new FiniteStateMachine('idle', [
      {
        from: 'idle',
        to: 'collecting_installment_due_date',
        when: input => input.includes('parcelado'),
      },
    ])

    const next = fsm.transition('quero cadastrar parcelado')

    expect(next).toBe('collecting_installment_due_date')
    expect(fsm.getState()).toBe('collecting_installment_due_date')
  })

  it('keeps current state when no transition matches', () => {
    const fsm = new FiniteStateMachine('idle', [
      {
        from: 'idle',
        to: 'collecting_installment_due_date',
        when: input => input.includes('parcelado'),
      },
    ])

    expect(fsm.transition('oi')).toBe('idle')
  })
})
