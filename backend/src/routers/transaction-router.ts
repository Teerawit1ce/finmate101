import { Hono } from 'hono'
import { describeRoute, resolver, validator } from 'hono-openapi'
import {
  transactionListResponseSchema,
  transactionResponseSchema,
} from '../schemas/transaction-schemas'
import { errorResponseSchema, idParamSchema } from '../schemas/user-schemas'
import type { AppEnv } from '../types'

const json = (s: Parameters<typeof resolver>[0]) => ({ 'application/json': { schema: resolver(s) } })

export function createTransactionRouter() {
  const r = new Hono<AppEnv>()

  r.get('/',
    describeRoute({ tags: ['Transactions'], summary: 'List transactions', responses: { 200: { content: json(transactionListResponseSchema) } } }),
    (c) => c.get('container').transactionHandler.list(c)
  )

  r.post('/',
    describeRoute({ tags: ['Transactions'], summary: 'Create transaction', responses: { 201: { content: json(transactionResponseSchema) }, 400: { content: json(errorResponseSchema) } } }),
    (c) => c.get('container').transactionHandler.create(c)
  )

  r.get('/:id',
    describeRoute({ tags: ['Transactions'], summary: 'Get transaction', responses: { 200: { content: json(transactionResponseSchema) }, 404: { content: json(errorResponseSchema) } } }),
    validator('param', idParamSchema),
    (c) => c.get('container').transactionHandler.get(c)
  )

  r.patch('/:id',
    describeRoute({ tags: ['Transactions'], summary: 'Update transaction', responses: { 200: { content: json(transactionResponseSchema) }, 404: { content: json(errorResponseSchema) } } }),
    validator('param', idParamSchema),
    (c) => c.get('container').transactionHandler.update(c)
  )

  r.delete('/:id',
    describeRoute({ tags: ['Transactions'], summary: 'Delete transaction', responses: { 204: {}, 404: { content: json(errorResponseSchema) } } }),
    validator('param', idParamSchema),
    (c) => c.get('container').transactionHandler.delete(c)
  )

  return r
}
