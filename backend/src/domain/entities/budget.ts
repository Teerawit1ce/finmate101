export interface Budget {
  id: string
  userId: string
  month: number
  year: number
  monthlyLimit: number
  dailyQuota: number
  createdAt: string
  updatedAt: string
}

export interface CreateBudgetInput {
  userId: string
  month: number
  year: number
  monthlyLimit?: number
  dailyQuota?: number
}

export interface UpdateBudgetInput {
  monthlyLimit?: number
  dailyQuota?: number
}
