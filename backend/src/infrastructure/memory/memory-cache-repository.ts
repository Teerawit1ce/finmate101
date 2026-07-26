import type { CacheRepository } from '../../domain/repositories/cache-repository'

export class MemoryCacheRepository implements CacheRepository {
  private readonly store = new Map<string, { value: unknown; expiresAt: number | null }>()

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key)
    if (!entry) return null
    if (entry.expiresAt !== null && entry.expiresAt < Date.now()) {
      this.store.delete(key)
      return null
    }
    return entry.value as T
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    this.store.set(key, {
      value,
      expiresAt: ttlSeconds !== undefined ? Date.now() + ttlSeconds * 1000 : null,
    })
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key)
  }
}
