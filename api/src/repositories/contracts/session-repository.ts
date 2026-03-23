export interface SessionHistoryEntry {
  role: 'user' | 'assistant'
  content: string
}

export interface SessionState {
  id: string
  currentState: string
  context: Record<string, unknown>
  history: SessionHistoryEntry[]
  updatedAt: Date
}

export interface SessionRepository {
  findById(id: string): Promise<SessionState | null>
  save(state: SessionState): Promise<void>
  delete(id: string): Promise<void>
}
