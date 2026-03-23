import type { SessionHistoryEntry } from '../../repositories/contracts/session-repository'

export interface ToolCall {
  name: string
  args: Record<string, unknown>
}

export interface AiConversationContext {
  currentState?: string
  pendingData?: Record<string, unknown>
  history: SessionHistoryEntry[]
  executeTool(call: ToolCall): Promise<unknown>
}

export interface AiConversationResult {
  message: string
  history: SessionHistoryEntry[]
}

export interface AiProvider {
  generateReply(
    userMessage: string,
    context: AiConversationContext
  ): Promise<AiConversationResult>
}
