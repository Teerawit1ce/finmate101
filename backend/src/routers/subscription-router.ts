import { Hono } from 'hono'
import { describeRoute, resolver, validator } from 'hono-openapi'
import {
  createSubscriptionSchema,
  subscriptionListResponseSchema,
  subscriptionResponseSchema,
  updateSubscriptionSchema,
} from '../schemas/subscription-schemas'
import { idParamSchema, errorResponseSchema } from '../schemas/user-schemas'
import type { AppEnv } from '../types'

const json = (s: Parameters<typeof resolver>[0]) => ({ 'application/json': { schema: resolver(s) } })

export function createSubscriptionRouter() {
  const r = new Hono<AppEnv>()

  r.get('/',
    describeRoute({ tags: ['Subscriptions'], summary: 'List subscriptions', responses: { 200: { content: json(subscriptionListResponseSchema) } } }),
    (c) => c.get('container').subscriptionHandler.list(c)
  )

  r.post('/',
    describeRoute({ tags: ['Subscriptions'], summary: 'Create subscription', responses: { 201: { content: json(subscriptionResponseSchema) }, 400: { content: json(errorResponseSchema) } } }),
    validator('json', createSubscriptionSchema),
    (c) => c.get('container').subscriptionHandler.create(c)
  )

  r.get('/:id',
    describeRoute({ tags: ['Subscriptions'], summary: 'Get subscription', responses: { 200: { content: json(subscriptionResponseSchema) }, 404: { content: json(errorResponseSchema) } } }),
    validator('param', idParamSchema),
    (c) => c.get('container').subscriptionHandler.get(c)
  )

  r.patch('/:id',
    describeRoute({ tags: ['Subscriptions'], summary: 'Update subscription', responses: { 200: { content: json(subscriptionResponseSchema) }, 404: { content: json(errorResponseSchema) } } }),
    validator('param', idParamSchema),
    validator('json', updateSubscriptionSchema),
    (c) => c.get('container').subscriptionHandler.update(c)
  )

  r.delete('/:id',
    describeRoute({ tags: ['Subscriptions'], summary: 'Delete subscription', responses: { 204: {}, 404: { content: json(errorResponseSchema) } } }),
    validator('param', idParamSchema),
    (c) => c.get('container').subscriptionHandler.delete(c)
  )

  return r
}
