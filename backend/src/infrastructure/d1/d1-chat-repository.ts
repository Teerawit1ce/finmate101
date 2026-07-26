import type { ChatMessage, CreateChatMessageInput } from '../../domain/entities/chat-message'
import type { ChatRepository } from '../../domain/repositories/chat-repository'

interface ChatRow {
  id: string
  user_id: string
  role: string
  content: string
  metadata: string | null
  created_at: string
}

function toMsg(r: ChatRow): ChatMessage {
  return {
    id: r.id, userId: r.user_id,
    role: r.role as 'user' | 'assistant' | 'system',
    content: r.content,
    metadata: r.metadata ? JSON.parse(r.metadata) : null,
    createdAt: r.created_at,
  }
}

export class D1ChatRepository implements ChatRepository {
  constructor(private readonly db: D1Database) {}

  async findByUserId(userId: string, limit = 50): Promise<ChatMessage[]> {
    const { results } = await this.db
      .prepare('SELECT * FROM chat_messages WHERE user_id = ? ORDER BY created_at DESC LIMIT ?')
      .bind(userId, limit)
      .all<ChatRow>()
    return results.map(toMsg).reverse()
  }

  async create(input: CreateChatMessageInput): Promise<ChatMessage> {
    const id = crypto.randomUUID()
    const createdAt = new Date().toISOString()
    const metadata = input.metadata ? JSON.stringify(input.metadata) : null
    await this.db
      .prepare('INSERT INTO chat_messages (id, user_id, role, content, metadata, created_at) VALUES (?,?,?,?,?,?)')
      .bind(id, input.userId, input.role, input.content, metadata, createdAt)
      .run()
    return { id, ...input, createdAt }
  }

  async deleteByUserId(userId: string): Promise<boolean> {
    const r = await this.db.prepare('DELETE FROM chat_messages WHERE user_id = ?').bind(userId).run()
    return r.meta.changes > 0
  }
}
