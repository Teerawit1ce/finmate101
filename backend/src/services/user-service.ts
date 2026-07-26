import type { CreateUserInput, UpdateUserInput, User } from '../domain/entities/user'
import { ConflictError, NotFoundError, ValidationError } from '../domain/errors'
import type { CacheRepository } from '../domain/repositories/cache-repository'
import type { UserRepository } from '../domain/repositories/user-repository'

const CACHE_TTL_SECONDS = 300
const cacheKey = (id: string) => `user:${id}`

export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly cache: CacheRepository
  ) {}

  async listUsers(): Promise<User[]> {
    return this.userRepository.findAll()
  }

  async getUser(id: string): Promise<User> {
    const cached = await this.cache.get<User>(cacheKey(id))
    if (cached) return cached

    const user = await this.userRepository.findById(id)
    if (!user) throw new NotFoundError('User')

    await this.cache.set(cacheKey(id), user, CACHE_TTL_SECONDS)
    return user
  }

  async createUser(input: CreateUserInput): Promise<User> {
    this.validateEmail(input.email)
    if (!input.name?.trim()) throw new ValidationError('name is required')

    const existing = await this.userRepository.findByEmail(input.email)
    if (existing) throw new ConflictError('Email is already registered')

    return this.userRepository.create({ email: input.email, name: input.name.trim() })
  }

  async updateUser(id: string, input: UpdateUserInput): Promise<User> {
    if (input.email !== undefined) this.validateEmail(input.email)

    const updated = await this.userRepository.update(id, input)
    if (!updated) throw new NotFoundError('User')

    await this.cache.delete(cacheKey(id))
    return updated
  }

  async deleteUser(id: string): Promise<void> {
    const deleted = await this.userRepository.delete(id)
    if (!deleted) throw new NotFoundError('User')
    await this.cache.delete(cacheKey(id))
  }

  private validateEmail(email: string): void {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ValidationError('email is invalid')
    }
  }
}
