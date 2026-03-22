import type {
  SessionRepository,
  SessionState,
} from '../contracts/session-repository'

export class InMemorySessionRepository implements SessionRepository {
  private sessions = new Map<string, SessionState>()

  async findById(id: string): Promise<SessionState | null> {
    return this.sessions.get(id) ?? null
  }

  async save(state: SessionState): Promise<void> {
    this.sessions.set(state.id, state)
  }

  async delete(id: string): Promise<void> {
    this.sessions.delete(id)
  }
}
