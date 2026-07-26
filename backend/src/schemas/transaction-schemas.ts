import { z } from 'zod'

export const transactionSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  type: z.enum(['income', 'expense']),
  category: z.string(),
  amount: z.number().positive(),
  description: z.string(),
  date: z.iso.datetime(),
  createdAt: z.iso.datetime(),
})

export const createTransactionSchema = z.object({
  userId: z.uuid(),
  type: z.enum(['income', 'expense']),
  category: z.string().min(1),
  amount: z.number().positive(),
  description: z.string().optional(),
  date: z.iso.datetime(),
})

export const updateTransactionSchema = createTransactionSchema.partial()

export const transactionResponseSchema = z.object({ data: transactionSchema })
export const transactionListResponseSchema = z.object({ data: z.array(transactionSchema) })
