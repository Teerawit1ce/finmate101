const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8787/api/v1'

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: res.statusText } }))
    throw new Error(err.error?.message || `Request failed: ${res.status}`)
  }
  if (res.status === 204) return null as T
  const json = await res.json()
  return json.data
}

// Users
export const usersApi = {
  list: () => request<any[]>('/users'),
  get: (id: string) => request<any>(`/users/${id}`),
  create: (data: { email: string; name: string }) =>
    request<any>('/users', { method: 'POST', body: JSON.stringify(data) }),
}

// Subscriptions
export const subscriptionsApi = {
  list: (userId: string) => request<any[]>(`/subscriptions?userId=${userId}`),
  get: (id: string) => request<any>(`/subscriptions/${id}`),
  create: (data: any) =>
    request<any>('/subscriptions', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    request<any>(`/subscriptions/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<void>(`/subscriptions/${id}`, { method: 'DELETE' }),
}

// Transactions
export const transactionsApi = {
  list: (userId: string, filters?: { month?: number; year?: number; type?: 'income' | 'expense' }) => {
    const params = new URLSearchParams({ userId })
    if (filters?.month) params.set('month', String(filters.month))
    if (filters?.year) params.set('year', String(filters.year))
    if (filters?.type) params.set('type', filters.type)
    return request<any[]>(`/transactions?${params}`)
  },
  get: (id: string) => request<any>(`/transactions/${id}`),
  create: (data: any) =>
    request<any>('/transactions', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    request<any>(`/transactions/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<void>(`/transactions/${id}`, { method: 'DELETE' }),
}

// Budgets
export const budgetsApi = {
  list: (userId: string) => request<any[]>(`/budgets?userId=${userId}`),
  getByMonth: (userId: string, month: number, year: number) =>
    request<any>(`/budgets/by-month?userId=${userId}&month=${month}&year=${year}`),
  create: (data: any) =>
    request<any>('/budgets', { method: 'POST', body: JSON.stringify(data) }),
  upsert: (userId: string, month: number, year: number, data: any) =>
    request<any>(`/budgets/upsert?userId=${userId}&month=${month}&year=${year}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    request<any>(`/budgets/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
}

// Chat
export const chatApi = {
  getHistory: (userId: string, limit = 50) =>
    request<any[]>(`/chat?userId=${userId}&limit=${limit}`),
  addMessage: (data: { userId: string; role: 'user' | 'assistant' | 'system'; content: string; metadata?: any }) =>
    request<any>('/chat', { method: 'POST', body: JSON.stringify(data) }),
  clearHistory: (userId: string) =>
    request<void>(`/chat?userId=${userId}`, { method: 'DELETE' }),
}
