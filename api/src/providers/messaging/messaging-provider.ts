export interface IncomingMessage {
  sessionId: string
  text: string
  rawChatId?: string
}

export interface MessagingProvider {
  onMessage(handler: (message: IncomingMessage) => Promise<void>): void
  sendMessage(targetId: string, message: string): Promise<void>
}
