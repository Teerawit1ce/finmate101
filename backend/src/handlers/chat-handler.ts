import type { Context } from 'hono'
import type { CreateChatMessageInput } from '../domain/entities/chat-message'
import { ValidationError } from '../domain/errors'
import type { ChatService } from '../services/chat-service'

export class ChatHandler {
  constructor(private readonly service: ChatService) {}

  history = async (c: Context) => {
    const userId = c.req.query('userId')
    if (!userId) throw new ValidationError('userId query param is required')
    const limit = c.req.query('limit') ? Number(c.req.query('limit')) : 50
    const messages = await this.service.getHistory(userId, limit)
    return c.json({ data: messages })
  }

  addMessage = async (c: Context) => {
    const body = await this.parseJson<CreateChatMessageInput>(c)
    const msg = await this.service.addMessage(body)
    return c.json({ data: msg }, 201)
  }

  clearHistory = async (c: Context) => {
    const userId = c.req.query('userId')
    if (!userId) throw new ValidationError('userId query param is required')
    await this.service.clearHistory(userId)
    return c.body(null, 204)
  }

  private async parseJson<T>(c: Context): Promise<T> {
    try {
      return await c.req.json<T>()
    } catch {
      throw new ValidationError('Invalid JSON body')
    }
  }
}
