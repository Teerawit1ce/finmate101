import { z } from 'zod'

export const budgetSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000),
  monthlyLimit: z.number().positive(),
  dailyQuota: z.number().positive(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export const createBudgetSchema = z.object({
  userId: z.uuid(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000),
  monthlyLimit: z.number().positive().optional(),
  dailyQuota: z.number().positive().optional(),
})

export const updateBudgetSchema = z.object({
  monthlyLimit: z.number().positive().optional(),
  dailyQuota: z.number().positive().optional(),
})

export const budgetResponseSchema = z.object({ data: budgetSchema })
export const budgetListResponseSchema = z.object({ data: z.array(budgetSchema) })
