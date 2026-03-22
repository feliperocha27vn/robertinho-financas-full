export interface StateTransition {
  from: string
  to: string
  when: (input: unknown) => boolean
}

export class FiniteStateMachine {
  constructor(
    private currentState: string,
    private readonly transitions: StateTransition[]
  ) {}

  getState() {
    return this.currentState
  }

  transition(input: unknown): string {
    const transition = this.transitions.find(
      item => item.from === this.currentState && item.when(input)
    )

    if (!transition) {
      return this.currentState
    }

    this.currentState = transition.to
    return this.currentState
  }
}
