import { Hono } from 'hono'
import type { AppEnv } from '../types'
import { createBudgetRouter } from './budget-router'
import { createChatRouter } from './chat-router'
import { createSubscriptionRouter } from './subscription-router'
import { createTransactionRouter } from './transaction-router'
import { createUserRouter } from './user-router'

export function createApiRouter() {
  const api = new Hono<AppEnv>()

  api.route('/users', createUserRouter())
  api.route('/subscriptions', createSubscriptionRouter())
  api.route('/transactions', createTransactionRouter())
  api.route('/budgets', createBudgetRouter())
  api.route('/chat', createChatRouter())

  return api
}
