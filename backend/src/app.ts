import { Scalar } from '@scalar/hono-api-reference'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { openAPIRouteHandler } from 'hono-openapi'
import type { Container } from './di/container'
import { AppError } from './domain/errors'
import { createApiRouter } from './routers'
import type { AppEnv, Bindings } from './types'

export function createApp(containerFactory: (env: Partial<Bindings>) => Container) {
  const app = new Hono<AppEnv>()

  app.use('*', logger())
  app.use('*', cors())
  app.use('*', async (c, next) => {
    c.set('container', containerFactory(c.env ?? {}))
    await next()
  })

  app.get('/health', (c) => c.json({ status: 'ok' }))
  app.route('/api/v1', createApiRouter())

  app.get(
    '/openapi.json',
    openAPIRouteHandler(app, {
      documentation: {
        info: {
          title: 'FinMate API',
          version: '1.0.0',
          description: 'Finance companion backend — subscriptions, budgets, transactions, chat',
        },
        tags: [
          { name: 'Users', description: 'User management' },
          { name: 'Subscriptions', description: 'Subscription tracking' },
          { name: 'Transactions', description: 'Income and expense transactions' },
          { name: 'Budgets', description: 'Monthly budget management' },
          { name: 'Chat', description: 'Chat messages' },
        ],
      },
    })
  )
  app.get('/docs', Scalar({ url: '/openapi.json', pageTitle: 'FinMate API Docs' }))

  app.notFound((c) => c.json({ error: { code: 'NOT_FOUND', message: 'Route not found' } }, 404))

  app.onError((err, c) => {
    if (err instanceof AppError) {
      return c.json({ error: { code: err.code, message: err.message } }, err.status as 400)
    }
    console.error('Unhandled error:', err)
    return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }, 500)
  })

  return app
}
