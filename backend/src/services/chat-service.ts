import type { ChatMessage, CreateChatMessageInput } from '../domain/entities/chat-message'
import { ValidationError } from '../domain/errors'
import type { ChatRepository } from '../domain/repositories/chat-repository'

export class ChatService {
  constructor(private readonly repo: ChatRepository) {}

  async getHistory(userId: string, limit = 50): Promise<ChatMessage[]> {
    return this.repo.findByUserId(userId, limit)
  }

  async addMessage(input: CreateChatMessageInput): Promise<ChatMessage> {
    if (!input.content.trim()) throw new ValidationError('content is required')
    return this.repo.create(input)
  }

  async clearHistory(userId: string): Promise<void> {
    await this.repo.deleteByUserId(userId)
  }
}
