export interface Subscription {
  id: string
  userId: string
  name: string
  serviceName: string
  category: string
  amount: number
  billingCycle: 'weekly' | 'monthly' | 'yearly'
  billingDate: number
  nextBilling: string
  isActive: boolean
  reminderDays: number
  logoUrl?: string | null
  notes?: string | null
  createdAt: string
}

export interface CreateSubscriptionInput {
  userId: string
  name: string
  serviceName: string
  category?: string
  amount: number
  billingCycle?: 'weekly' | 'monthly' | 'yearly'
  billingDate: number
  nextBilling: string
  reminderDays?: number
  logoUrl?: string | null
  notes?: string | null
}

export interface UpdateSubscriptionInput {
  name?: string
  serviceName?: string
  category?: string
  amount?: number
  billingCycle?: 'weekly' | 'monthly' | 'yearly'
  billingDate?: number
  nextBilling?: string
  isActive?: boolean
  reminderDays?: number
  logoUrl?: string | null
  notes?: string | null
}
