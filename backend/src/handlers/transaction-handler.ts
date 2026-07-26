import type { Context } from 'hono'
import type { CreateTransactionInput, UpdateTransactionInput } from '../domain/entities/transaction'
import { ValidationError } from '../domain/errors'
import type { TransactionService } from '../services/transaction-service'

export class TransactionHandler {
  constructor(private readonly service: TransactionService) {}

  list = async (c: Context) => {
    const userId = c.req.query('userId')
    if (!userId) throw new ValidationError('userId query param is required')
    const month = c.req.query('month') ? Number(c.req.query('month')) : undefined
    const year = c.req.query('year') ? Number(c.req.query('year')) : undefined
    const type = c.req.query('type') as 'income' | 'expense' | undefined
    const txs = await this.service.listByUser(userId, { month, year, type })
    return c.json({ data: txs })
  }

  get = async (c: Context) => {
    const tx = await this.service.get(this.param(c, 'id'))
    return c.json({ data: tx })
  }

  create = async (c: Context) => {
    const body = await this.parseJson<CreateTransactionInput>(c)
    const tx = await this.service.create(body)
    return c.json({ data: tx }, 201)
  }

  update = async (c: Context) => {
    const body = await this.parseJson<UpdateTransactionInput>(c)
    const tx = await this.service.update(this.param(c, 'id'), body)
    return c.json({ data: tx })
  }

  delete = async (c: Context) => {
    await this.service.delete(this.param(c, 'id'))
    return c.body(null, 204)
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
