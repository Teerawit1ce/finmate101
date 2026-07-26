import type { CreateTransactionInput, Transaction, UpdateTransactionInput } from '../entities/transaction'

export interface TransactionRepository {
  findAll(userId: string, filters?: { month?: number; year?: number; type?: 'income' | 'expense' }): Promise<Transaction[]>
  findById(id: string): Promise<Transaction | null>
  create(input: CreateTransactionInput): Promise<Transaction>
  update(id: string, input: UpdateTransactionInput): Promise<Transaction | null>
  delete(id: string): Promise<boolean>
}
