import type { CreateSubscriptionInput, Subscription, UpdateSubscriptionInput } from '../domain/entities/subscription'
import { NotFoundError, ValidationError } from '../domain/errors'
import type { SubscriptionRepository } from '../domain/repositories/subscription-repository'

export class SubscriptionService {
  constructor(private readonly repo: SubscriptionRepository) {}

  async listByUser(userId: string): Promise<Subscription[]> {
    return this.repo.findAll(userId)
  }

  async get(id: string): Promise<Subscription> {
    const sub = await this.repo.findById(id)
    if (!sub) throw new NotFoundError('Subscription')
    return sub
  }

  async create(input: CreateSubscriptionInput): Promise<Subscription> {
    if (!input.name.trim()) throw new ValidationError('name is required')
    if (!input.serviceName.trim()) throw new ValidationError('serviceName is required')
    if (input.amount <= 0) throw new ValidationError('amount must be > 0')
    if (input.billingDate < 1 || input.billingDate > 31) throw new ValidationError('billingDate must be 1-31')
    return this.repo.create(input)
  }

  async update(id: string, input: UpdateSubscriptionInput): Promise<Subscription> {
    if (input.amount !== undefined && input.amount <= 0) throw new ValidationError('amount must be > 0')
    const updated = await this.repo.update(id, input)
    if (!updated) throw new NotFoundError('Subscription')
    return updated
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.repo.delete(id)
    if (!deleted) throw new NotFoundError('Subscription')
  }
}
