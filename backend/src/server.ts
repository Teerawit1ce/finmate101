// Cloudflare Workers entrypoint (referenced by wrangler.jsonc "main").
// Wires D1 + KV implementations into the runtime-agnostic app.
import { createApp } from './app'
import { createContainer } from './di/container'
import { D1BudgetRepository } from './infrastructure/d1/d1-budget-repository'
import { D1ChatRepository } from './infrastructure/d1/d1-chat-repository'
import { D1SubscriptionRepository } from './infrastructure/d1/d1-subscription-repository'
import { D1TransactionRepository } from './infrastructure/d1/d1-transaction-repository'
import { D1UserRepository } from './infrastructure/d1/d1-user-repository'
import { KVCacheRepository } from './infrastructure/kv/kv-cache-repository'
import type { Bindings } from './types'

const app = createApp((env) => {
  const bindings = env as Bindings
  return createContainer({
    userRepository: new D1UserRepository(bindings.DB),
    cacheRepository: new KVCacheRepository(bindings.KV),
    subscriptionRepository: new D1SubscriptionRepository(bindings.DB),
    transactionRepository: new D1TransactionRepository(bindings.DB),
    budgetRepository: new D1BudgetRepository(bindings.DB),
    chatRepository: new D1ChatRepository(bindings.DB),
  })
})

export default app
