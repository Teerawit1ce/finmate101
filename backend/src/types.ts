import type { Container } from './di/container'

// Cloudflare Workers bindings (declared in wrangler.jsonc)
export interface Bindings {
  DB: D1Database
  KV: KVNamespace
  ENVIRONMENT?: string
}

export interface Variables {
  container: Container
}

export type AppEnv = {
  Bindings: Bindings
  Variables: Variables
}
