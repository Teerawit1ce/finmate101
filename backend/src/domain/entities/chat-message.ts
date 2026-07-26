export interface ChatMessage {
  id: string
  userId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  metadata?: Record<string, unknown> | null
  createdAt: string
}

export interface CreateChatMessageInput {
  userId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  metadata?: Record<string, unknown> | null
}
