import type { ChatMessage, CreateChatMessageInput } from '../entities/chat-message'

export interface ChatRepository {
  findByUserId(userId: string, limit?: number): Promise<ChatMessage[]>
  create(input: CreateChatMessageInput): Promise<ChatMessage>
  deleteByUserId(userId: string): Promise<boolean>
}
