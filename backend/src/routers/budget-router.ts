import { Hono } from 'hono'
import { describeRoute, resolver, validator } from 'hono-openapi'
import {
  budgetListResponseSchema,
  budgetResponseSchema,
} from '../schemas/budget-schemas'
import { errorResponseSchema, idParamSchema } from '../schemas/user-schemas'
import type { AppEnv } from '../types'

const json = (s: Parameters<typeof resolver>[0]) => ({ 'application/json': { schema: resolver(s) } })

export function createBudgetRouter() {
  const r = new Hono<AppEnv>()

  r.get('/',
    describeRoute({ tags: ['Budgets'], summary: 'List budgets', responses: { 200: { content: json(budgetListResponseSchema) } } }),
    (c) => c.get('container').budgetHandler.list(c)
  )

  r.get('/by-month',
    describeRoute({ tags: ['Budgets'], summary: 'Get budget by month', responses: { 200: { content: json(budgetResponseSchema) }, 404: { content: json(errorResponseSchema) } } }),
    (c) => c.get('container').budgetHandler.getByMonth(c)
  )

  r.post('/',
    describeRoute({ tags: ['Budgets'], summary: 'Create budget', responses: { 201: { content: json(budgetResponseSchema) }, 409: { content: json(errorResponseSchema) } } }),
    (c) => c.get('container').budgetHandler.create(c)
  )

  r.put('/upsert',
    describeRoute({ tags: ['Budgets'], summary: 'Create or update budget for month', responses: { 200: { content: json(budgetResponseSchema) } } }),
    (c) => c.get('container').budgetHandler.upsert(c)
  )

  r.get('/:id',
    describeRoute({ tags: ['Budgets'], summary: 'Get budget', responses: { 200: { content: json(budgetResponseSchema) }, 404: { content: json(errorResponseSchema) } } }),
    validator('param', idParamSchema),
    (c) => c.get('container').budgetHandler.get(c)
  )

  r.patch('/:id',
    describeRoute({ tags: ['Budgets'], summary: 'Update budget', responses: { 200: { content: json(budgetResponseSchema) }, 404: { content: json(errorResponseSchema) } } }),
    validator('param', idParamSchema),
    (c) => c.get('container').budgetHandler.update(c)
  )

  return r
}
