export interface User {
  id: string
  email: string
  name: string
  createdAt: string
}

export interface CreateUserInput {
  email: string
  name: string
}

export interface UpdateUserInput {
  email?: string
  name?: string
}
