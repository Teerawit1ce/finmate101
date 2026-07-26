import type { Context } from 'hono'
import type { CreateBudgetInput, UpdateBudgetInput } from '../domain/entities/budget'
import { ValidationError } from '../domain/errors'
import type { BudgetService } from '../services/budget-service'

export class BudgetHandler {
  constructor(private readonly service: BudgetService) {}

  list = async (c: Context) => {
    const userId = c.req.query('userId')
    if (!userId) throw new ValidationError('userId query param is required')
    const budgets = await this.service.listByUser(userId)
    return c.json({ data: budgets })
  }

  get = async (c: Context) => {
    const budget = await this.service.get(this.param(c, 'id'))
    return c.json({ data: budget })
  }

  getByMonth = async (c: Context) => {
    const userId = c.req.query('userId')
    if (!userId) throw new ValidationError('userId query param is required')
    const month = Number(c.req.query('month'))
    const year = Number(c.req.query('year'))
    if (!month || !year) throw new ValidationError('month and year query params are required')
    const budget = await this.service.getByMonth(userId, month, year)
    return c.json({ data: budget })
  }

  create = async (c: Context) => {
    const body = await this.parseJson<CreateBudgetInput>(c)
    const budget = await this.service.create(body)
    return c.json({ data: budget }, 201)
  }

  update = async (c: Context) => {
    const body = await this.parseJson<UpdateBudgetInput>(c)
    const budget = await this.service.update(this.param(c, 'id'), body)
    return c.json({ data: budget })
  }

  upsert = async (c: Context) => {
    const userId = c.req.query('userId')
    if (!userId) throw new ValidationError('userId query param is required')
    const month = Number(c.req.query('month'))
    const year = Number(c.req.query('year'))
    if (!month || !year) throw new ValidationError('month and year query params are required')
    const body = await this.parseJson<{ monthlyLimit?: number; dailyQuota?: number }>(c)
    const budget = await this.service.upsert(userId, month, year, body)
    return c.json({ data: budget })
  }

  private param(c: Context, name: string): string {
    const value = c.req.param(name)
    if (!value) throw new ValidationError(`${name} param is required`)
    return value
  }

  private async parseJson<T>(c: Context): Promise<T> {
    try {
      return await c.req.json<T>()
    } catch {
      throw new ValidationError('Invalid JSON body')
    }
  }
}
