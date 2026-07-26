import type { CacheRepository } from '../../domain/repositories/cache-repository'

export class KVCacheRepository implements CacheRepository {
  constructor(private readonly kv: KVNamespace) {}

  async get<T>(key: string): Promise<T | null> {
    return this.kv.get<T>(key, 'json')
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    await this.kv.put(key, JSON.stringify(value), {
      // KV requires a minimum TTL of 60 seconds
      expirationTtl: ttlSeconds !== undefined ? Math.max(ttlSeconds, 60) : undefined,
    })
  }

  async delete(key: string): Promise<void> {
    await this.kv.delete(key)
  }
}
