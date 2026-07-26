import { Hono } from 'hono'
import { describeRoute, resolver } from 'hono-openapi'
import {
  chatMessageListResponseSchema,
  chatMessageResponseSchema,
} from '../schemas/chat-schemas'
import { errorResponseSchema } from '../schemas/user-schemas'
import type { AppEnv } from '../types'

const json = (s: Parameters<typeof resolver>[0]) => ({ 'application/json': { schema: resolver(s) } })

export function createChatRouter() {
  const r = new Hono<AppEnv>()

  r.get('/',
    describeRoute({ tags: ['Chat'], summary: 'Get chat history', responses: { 200: { content: json(chatMessageListResponseSchema) } } }),
    (c) => c.get('container').chatHandler.history(c)
  )

  r.post('/',
    describeRoute({ tags: ['Chat'], summary: 'Add chat message', responses: { 201: { content: json(chatMessageResponseSchema) } } }),
    (c) => c.get('container').chatHandler.addMessage(c)
  )

  r.delete('/',
    describeRoute({ tags: ['Chat'], summary: 'Clear chat history', responses: { 204: {} } }),
    (c) => c.get('container').chatHandler.clearHistory(c)
  )

  return r
}
