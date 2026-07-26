import type { Budget, CreateBudgetInput, UpdateBudgetInput } from '../domain/entities/budget'
import { ConflictError, NotFoundError, ValidationError } from '../domain/errors'
import type { BudgetRepository } from '../domain/repositories/budget-repository'

export class BudgetService {
  constructor(private readonly repo: BudgetRepository) {}

  async listByUser(userId: string): Promise<Budget[]> {
    return this.repo.findByUserId(userId)
  }

  async get(id: string): Promise<Budget> {
    const b = await this.repo.findById(id)
    if (!b) throw new NotFoundError('Budget')
    return b
  }

  async getByMonth(userId: string, month: number, year: number): Promise<Budget> {
    const b = await this.repo.findByUserMonthYear(userId, month, year)
    if (!b) throw new NotFoundError('Budget')
    return b
  }

  async create(input: CreateBudgetInput): Promise<Budget> {
    if (input.month < 1 || input.month > 12) throw new ValidationError('month must be 1-12')
    if (input.year < 2000) throw new ValidationError('year is invalid')
    const existing = await this.repo.findByUserMonthYear(input.userId, input.month, input.year)
    if (existing) throw new ConflictError('Budget for this month already exists')
    return this.repo.create(input)
  }

  async update(id: string, input: UpdateBudgetInput): Promise<Budget> {
    const updated = await this.repo.update(id, input)
    if (!updated) throw new NotFoundError('Budget')
    return updated
  }

  async upsert(userId: string, month: number, year: number, input: { monthlyLimit?: number; dailyQuota?: number }): Promise<Budget> {
    const existing = await this.repo.findByUserMonthYear(userId, month, year)
    if (existing) {
      const updated = await this.repo.update(existing.id, input)
      if (!updated) throw new NotFoundError('Budget')
      return updated
    }
    return this.repo.create({ userId, month, year, monthlyLimit: input.monthlyLimit, dailyQuota: input.dailyQuota })
  }
}
