import type { CreateUserInput, UpdateUserInput, User } from '../../domain/entities/user'
import type { UserRepository } from '../../domain/repositories/user-repository'

interface UserRow {
  id: string
  email: string
  name: string
  created_at: string
}

function toUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    createdAt: row.created_at,
  }
}

export class D1UserRepository implements UserRepository {
  constructor(private readonly db: D1Database) {}

  async findAll(): Promise<User[]> {
    const { results } = await this.db
      .prepare('SELECT id, email, name, created_at FROM users ORDER BY created_at DESC')
      .all<UserRow>()
    return results.map(toUser)
  }

  async findById(id: string): Promise<User | null> {
    const row = await this.db
      .prepare('SELECT id, email, name, created_at FROM users WHERE id = ?')
      .bind(id)
      .first<UserRow>()
    return row ? toUser(row) : null
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.db
      .prepare('SELECT id, email, name, created_at FROM users WHERE email = ?')
      .bind(email)
      .first<UserRow>()
    return row ? toUser(row) : null
  }

  async create(input: CreateUserInput): Promise<User> {
    const id = crypto.randomUUID()
    const createdAt = new Date().toISOString()
    await this.db
      .prepare('INSERT INTO users (id, email, name, created_at) VALUES (?, ?, ?, ?)')
      .bind(id, input.email, input.name, createdAt)
      .run()
    return { id, email: input.email, name: input.name, createdAt }
  }

  async update(id: string, input: UpdateUserInput): Promise<User | null> {
    const existing = await this.findById(id)
    if (!existing) return null

    const email = input.email ?? existing.email
    const name = input.name ?? existing.name
    await this.db
      .prepare('UPDATE users SET email = ?, name = ? WHERE id = ?')
      .bind(email, name, id)
      .run()
    return { ...existing, email, name }
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.prepare('DELETE FROM users WHERE id = ?').bind(id).run()
    return result.meta.changes > 0
  }
}
