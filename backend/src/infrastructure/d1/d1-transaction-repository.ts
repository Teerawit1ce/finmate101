import type { CreateTransactionInput, Transaction, UpdateTransactionInput } from '../../domain/entities/transaction'
import type { TransactionRepository } from '../../domain/repositories/transaction-repository'

interface TxRow {
  id: string
  user_id: string
  type: string
  category: string
  amount: number
  description: string
  date: string
  created_at: string
}

function toTx(r: TxRow): Transaction {
  return { id: r.id, userId: r.user_id, type: r.type as 'income' | 'expense', category: r.category, amount: r.amount, description: r.description, date: r.date, createdAt: r.created_at }
}

export class D1TransactionRepository implements TransactionRepository {
  constructor(private readonly db: D1Database) {}

  async findAll(userId: string, filters?: { month?: number; year?: number; type?: 'income' | 'expense' }): Promise<Transaction[]> {
    let sql = 'SELECT * FROM transactions WHERE user_id = ?'
    const params: unknown[] = [userId]
    if (filters?.type) { sql += ' AND type = ?'; params.push(filters.type) }
    if (filters?.year) { sql += ' AND CAST(strftime("%Y", date) AS INTEGER) = ?'; params.push(filters.year) }
    if (filters?.month) { sql += ' AND CAST(strftime("%m", date) AS INTEGER) = ?'; params.push(filters.month) }
    sql += ' ORDER BY date DESC'
    const { results } = await this.db.prepare(sql).bind(...params).all<TxRow>()
    return results.map(toTx)
  }

  async findById(id: string): Promise<Transaction | null> {
    const r = await this.db.prepare('SELECT * FROM transactions WHERE id = ?').bind(id).first<TxRow>()
    return r ? toTx(r) : null
  }

  async create(input: CreateTransactionInput): Promise<Transaction> {
    const id = crypto.randomUUID()
    const createdAt = new Date().toISOString()
    await this.db
      .prepare('INSERT INTO transactions (id, user_id, type, category, amount, description, date, created_at) VALUES (?,?,?,?,?,?,?,?)')
      .bind(id, input.userId, input.type, input.category, input.amount, input.description ?? '', input.date, createdAt)
      .run()
    return { id, ...input, description: input.description ?? '', createdAt }
  }

  async update(id: string, input: UpdateTransactionInput): Promise<Transaction | null> {
    const existing = await this.findById(id)
    if (!existing) return null
    const merged = { ...existing, ...Object.fromEntries(Object.entries(input).filter(([, v]) => v !== undefined)) }
    await this.db
      .prepare('UPDATE transactions SET type=?, category=?, amount=?, description=?, date=? WHERE id=?')
      .bind(merged.type, merged.category, merged.amount, merged.description, merged.date, id)
      .run()
    return merged
  }

  async delete(id: string): Promise<boolean> {
    const r = await this.db.prepare('DELETE FROM transactions WHERE id = ?').bind(id).run()
    return r.meta.changes > 0
  }
}
