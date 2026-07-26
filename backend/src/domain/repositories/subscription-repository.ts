import type { CreateSubscriptionInput, Subscription, UpdateSubscriptionInput } from '../entities/subscription'

export interface SubscriptionRepository {
  findAll(userId: string): Promise<Subscription[]>
  findById(id: string): Promise<Subscription | null>
  findByUserIdAndName(userId: string, name: string): Promise<Subscription | null>
  create(input: CreateSubscriptionInput): Promise<Subscription>
  update(id: string, input: UpdateSubscriptionInput): Promise<Subscription | null>
  delete(id: string): Promise<boolean>
}
