export interface SessionState {
  id: string
  currentState: string
  context: Record<string, unknown>
  updatedAt: Date
}

export interface SessionRepository {
  findById(id: string): Promise<SessionState | null>
  save(state: SessionState): Promise<void>
  delete(id: string): Promise<void>
}
