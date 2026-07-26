import type { Budget, CreateBudgetInput, UpdateBudgetInput } from '../entities/budget'

export interface BudgetRepository {
  findByUserId(userId: string): Promise<Budget[]>
  findById(id: string): Promise<Budget | null>
  findByUserMonthYear(userId: string, month: number, year: number): Promise<Budget | null>
  create(input: CreateBudgetInput): Promise<Budget>
  update(id: string, input: UpdateBudgetInput): Promise<Budget | null>
  delete(id: string): Promise<boolean>
}
