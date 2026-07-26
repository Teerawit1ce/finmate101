import type { CreateTransactionInput, Transaction, UpdateTransactionInput } from '../domain/entities/transaction'
import { NotFoundError, ValidationError } from '../domain/errors'
import type { TransactionRepository } from '../domain/repositories/transaction-repository'

export class TransactionService {
  constructor(private readonly repo: TransactionRepository) {}

  async listByUser(userId: string, filters?: { month?: number; year?: number; type?: 'income' | 'expense' }): Promise<Transaction[]> {
    return this.repo.findAll(userId, filters)
  }

  async get(id: string): Promise<Transaction> {
    const tx = await this.repo.findById(id)
    if (!tx) throw new NotFoundError('Transaction')
    return tx
  }

  async create(input: CreateTransactionInput): Promise<Transaction> {
    if (input.amount <= 0) throw new ValidationError('amount must be > 0')
    if (!input.category.trim()) throw new ValidationError('category is required')
    return this.repo.create(input)
  }

  async update(id: string, input: UpdateTransactionInput): Promise<Transaction> {
    if (input.amount !== undefined && input.amount <= 0) throw new ValidationError('amount must be > 0')
    const updated = await this.repo.update(id, input)
    if (!updated) throw new NotFoundError('Transaction')
    return updated
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.repo.delete(id)
    if (!deleted) throw new NotFoundError('Transaction')
  }
}
