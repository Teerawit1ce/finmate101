import type { Context } from 'hono'
import type { CreateSubscriptionInput, UpdateSubscriptionInput } from '../domain/entities/subscription'
import { ValidationError } from '../domain/errors'
import type { SubscriptionService } from '../services/subscription-service'

export class SubscriptionHandler {
  constructor(private readonly service: SubscriptionService) {}

  list = async (c: Context) => {
    const userId = c.req.query('userId')
    if (!userId) throw new ValidationError('userId query param is required')
    const subs = await this.service.listByUser(userId)
    return c.json({ data: subs })
  }

  get = async (c: Context) => {
    const sub = await this.service.get(this.param(c, 'id'))
    return c.json({ data: sub })
  }

  create = async (c: Context) => {
    const body = await this.parseJson<CreateSubscriptionInput>(c)
    const sub = await this.service.create(body)
    return c.json({ data: sub }, 201)
  }

  update = async (c: Context) => {
    const body = await this.parseJson<UpdateSubscriptionInput>(c)
    const sub = await this.service.update(this.param(c, 'id'), body)
    return c.json({ data: sub })
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
