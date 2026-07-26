import { z } from 'zod'

export const chatMessageSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  metadata: z.record(z.unknown()).nullable().optional(),
  createdAt: z.iso.datetime(),
})

export const createChatMessageSchema = z.object({
  userId: z.uuid(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1),
  metadata: z.record(z.unknown()).nullable().optional(),
})

export const chatMessageResponseSchema = z.object({ data: chatMessageSchema })
export const chatMessageListResponseSchema = z.object({ data: z.array(chatMessageSchema) })
