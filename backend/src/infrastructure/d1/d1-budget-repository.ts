import type { Budget, CreateBudgetInput, UpdateBudgetInput } from '../../domain/entities/budget'
import type { BudgetRepository } from '../../domain/repositories/budget-repository'

interface BudgetRow {
  id: string
  user_id: string
  month: number
  year: number
  monthly_limit: number
  daily_quota: number
  created_at: string
  updated_at: string
}

function toBudget(r: BudgetRow): Budget {
  return { id: r.id, userId: r.user_id, month: r.month, year: r.year, monthlyLimit: r.monthly_limit, dailyQuota: r.daily_quota, createdAt: r.created_at, updatedAt: r.updated_at }
}

export class D1BudgetRepository implements BudgetRepository {
  constructor(private readonly db: D1Database) {}

  async findByUserId(userId: string): Promise<Budget[]> {
    const { results } = await this.db
      .prepare('SELECT * FROM budgets WHERE user_id = ? ORDER BY year DESC, month DESC')
      .bind(userId)
      .all<BudgetRow>()
    return results.map(toBudget)
  }

  async findById(id: string): Promise<Budget | null> {
    const r = await this.db.prepare('SELECT * FROM budgets WHERE id = ?').bind(id).first<BudgetRow>()
    return r ? toBudget(r) : null
  }

  async findByUserMonthYear(userId: string, month: number, year: number): Promise<Budget | null> {
    const r = await this.db
      .prepare('SELECT * FROM budgets WHERE user_id = ? AND month = ? AND year = ?')
      .bind(userId, month, year)
      .first<BudgetRow>()
    return r ? toBudget(r) : null
  }

  async create(input: CreateBudgetInput): Promise<Budget> {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    const monthlyLimit = input.monthlyLimit ?? 12000
    const dailyQuota = input.dailyQuota ?? Math.round(monthlyLimit / 30)
    await this.db
      .prepare('INSERT INTO budgets (id, user_id, month, year, monthly_limit, daily_quota, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?)')
      .bind(id, input.userId, input.month, input.year, monthlyLimit, dailyQuota, now, now)
      .run()
    return { id, userId: input.userId, month: input.month, year: input.year, monthlyLimit, dailyQuota, createdAt: now, updatedAt: now }
  }

  async update(id: string, input: UpdateBudgetInput): Promise<Budget | null> {
    const existing = await this.findById(id)
    if (!existing) return null
    const monthlyLimit = input.monthlyLimit ?? existing.monthlyLimit
    const dailyQuota = input.dailyQuota ?? existing.dailyQuota
    const now = new Date().toISOString()
    await this.db
      .prepare('UPDATE budgets SET monthly_limit=?, daily_quota=?, updated_at=? WHERE id=?')
      .bind(monthlyLimit, dailyQuota, now, id)
      .run()
    return { ...existing, monthlyLimit, dailyQuota, updatedAt: now }
  }

  async delete(id: string): Promise<boolean> {
    const r = await this.db.prepare('DELETE FROM budgets WHERE id = ?').bind(id).run()
    return r.meta.changes > 0
  }
}
