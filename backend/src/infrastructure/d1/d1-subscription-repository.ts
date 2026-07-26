import type { CreateSubscriptionInput, Subscription, UpdateSubscriptionInput } from '../../domain/entities/subscription'
import type { SubscriptionRepository } from '../../domain/repositories/subscription-repository'

interface SubRow {
  id: string
  user_id: string
  name: string
  service_name: string
  category: string
  amount: number
  billing_cycle: string
  billing_date: number
  next_billing: string
  is_active: number
  reminder_days: number
  logo_url: string | null
  notes: string | null
  created_at: string
}

function toSub(r: SubRow): Subscription {
  return {
    id: r.id,
    userId: r.user_id,
    name: r.name,
    serviceName: r.service_name,
    category: r.category,
    amount: r.amount,
    billingCycle: r.billing_cycle as 'weekly' | 'monthly' | 'yearly',
    billingDate: r.billing_date,
    nextBilling: r.next_billing,
    isActive: r.is_active === 1,
    reminderDays: r.reminder_days,
    logoUrl: r.logo_url,
    notes: r.notes,
    createdAt: r.created_at,
  }
}

export class D1SubscriptionRepository implements SubscriptionRepository {
  constructor(private readonly db: D1Database) {}

  async findAll(userId: string): Promise<Subscription[]> {
    const { results } = await this.db
      .prepare('SELECT * FROM subscriptions WHERE user_id = ? ORDER BY next_billing ASC')
      .bind(userId)
      .all<SubRow>()
    return results.map(toSub)
  }

  async findById(id: string): Promise<Subscription | null> {
    const row = await this.db.prepare('SELECT * FROM subscriptions WHERE id = ?').bind(id).first<SubRow>()
    return row ? toSub(row) : null
  }

  async findByUserIdAndName(userId: string, name: string): Promise<Subscription | null> {
    const row = await this.db
      .prepare('SELECT * FROM subscriptions WHERE user_id = ? AND name = ?')
      .bind(userId, name)
      .first<SubRow>()
    return row ? toSub(row) : null
  }

  async create(input: CreateSubscriptionInput): Promise<Subscription> {
    const id = crypto.randomUUID()
    const createdAt = new Date().toISOString()
    await this.db
      .prepare(
        `INSERT INTO subscriptions (id, user_id, name, service_name, category, amount, billing_cycle, billing_date, next_billing, is_active, reminder_days, logo_url, notes, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id, input.userId, input.name, input.serviceName,
        input.category ?? 'บันเทิง', input.amount,
        input.billingCycle ?? 'monthly', input.billingDate,
        input.nextBilling, 1, input.reminderDays ?? 1,
        input.logoUrl ?? null, input.notes ?? null, createdAt
      )
      .run()
    return { ...input, id, category: input.category ?? 'บันเทิง', billingCycle: input.billingCycle ?? 'monthly', isActive: true, reminderDays: input.reminderDays ?? 1, createdAt }
  }

  async update(id: string, input: UpdateSubscriptionInput): Promise<Subscription | null> {
    const existing = await this.findById(id)
    if (!existing) return null
    const merged: Subscription = {
      ...existing,
      ...Object.fromEntries(Object.entries(input).filter(([, v]) => v !== undefined)),
    }
    await this.db
      .prepare(
        `UPDATE subscriptions SET name=?, service_name=?, category=?, amount=?, billing_cycle=?, billing_date=?, next_billing=?, is_active=?, reminder_days=?, logo_url=?, notes=? WHERE id=?`
      )
      .bind(
        merged.name, merged.serviceName, merged.category, merged.amount,
        merged.billingCycle, merged.billingDate, merged.nextBilling,
        merged.isActive ? 1 : 0, merged.reminderDays,
        merged.logoUrl ?? null, merged.notes ?? null, id
      )
      .run()
    return merged
  }

  async delete(id: string): Promise<boolean> {
    const r = await this.db.prepare('DELETE FROM subscriptions WHERE id = ?').bind(id).run()
    return r.meta.changes > 0
  }
}
