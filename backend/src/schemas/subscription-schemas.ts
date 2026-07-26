import { z } from 'zod'

export const subscriptionSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  name: z.string(),
  serviceName: z.string(),
  category: z.string(),
  amount: z.number().positive(),
  billingCycle: z.enum(['weekly', 'monthly', 'yearly']),
  billingDate: z.number().int().min(1).max(31),
  nextBilling: z.string(), // ISO date or datetime
  isActive: z.boolean(),
  reminderDays: z.number().int().min(0),
  logoUrl: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  createdAt: z.iso.datetime(),
})

export const createSubscriptionSchema = z.object({
  userId: z.uuid(),
  name: z.string().min(1),
  serviceName: z.string().min(1),
  category: z.string().optional(),
  amount: z.number().positive(),
  billingCycle: z.enum(['weekly', 'monthly', 'yearly']).optional(),
  billingDate: z.number().int().min(1).max(31),
  nextBilling: z.string(), // ISO date or datetime
  reminderDays: z.number().int().min(0).optional(),
  logoUrl: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})

export const updateSubscriptionSchema = createSubscriptionSchema.partial()

export const subscriptionResponseSchema = z.object({ data: subscriptionSchema })
export const subscriptionListResponseSchema = z.object({ data: z.array(subscriptionSchema) })
