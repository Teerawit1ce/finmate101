import type { BudgetRepository } from '../domain/repositories/budget-repository'
import type { CacheRepository } from '../domain/repositories/cache-repository'
import type { ChatRepository } from '../domain/repositories/chat-repository'
import type { SubscriptionRepository } from '../domain/repositories/subscription-repository'
import type { TransactionRepository } from '../domain/repositories/transaction-repository'
import type { UserRepository } from '../domain/repositories/user-repository'
import { BudgetHandler } from '../handlers/budget-handler'
import { ChatHandler } from '../handlers/chat-handler'
import { SubscriptionHandler } from '../handlers/subscription-handler'
import { TransactionHandler } from '../handlers/transaction-handler'
import { UserHandler } from '../handlers/user-handler'
import { BudgetService } from '../services/budget-service'
import { ChatService } from '../services/chat-service'
import { SubscriptionService } from '../services/subscription-service'
import { TransactionService } from '../services/transaction-service'
import { UserService } from '../services/user-service'

export interface Repositories {
  userRepository: UserRepository
  cacheRepository: CacheRepository
  subscriptionRepository: SubscriptionRepository
  transactionRepository: TransactionRepository
  budgetRepository: BudgetRepository
  chatRepository: ChatRepository
}

export interface Container {
  userHandler: UserHandler
  subscriptionHandler: SubscriptionHandler
  transactionHandler: TransactionHandler
  budgetHandler: BudgetHandler
  chatHandler: ChatHandler
}

export function createContainer(repos: Repositories): Container {
  const userService = new UserService(repos.userRepository, repos.cacheRepository)
  const subscriptionService = new SubscriptionService(repos.subscriptionRepository)
  const transactionService = new TransactionService(repos.transactionRepository)
  const budgetService = new BudgetService(repos.budgetRepository)
  const chatService = new ChatService(repos.chatRepository)

  return {
    userHandler: new UserHandler(userService),
    subscriptionHandler: new SubscriptionHandler(subscriptionService),
    transactionHandler: new TransactionHandler(transactionService),
    budgetHandler: new BudgetHandler(budgetService),
    chatHandler: new ChatHandler(chatService),
  }
}
