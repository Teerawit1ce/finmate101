export interface Transaction {
  id: string
  userId: string
  type: 'income' | 'expense'
  category: string
  amount: number
  description: string
  date: string
  createdAt: string
}

export interface CreateTransactionInput {
  userId: string
  type: 'income' | 'expense'
  category: string
  amount: number
  description?: string
  date: string
}

export interface UpdateTransactionInput {
  type?: 'income' | 'expense'
  category?: string
  amount?: number
  description?: string
  date?: string
}
