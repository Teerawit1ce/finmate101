// AWS Lambda entrypoint (bundled by `npm run build:lambda`).
// Lambda has no D1/KV bindings, so in-memory repositories are wired in here.
// Replace with DynamoDB/RDS/ElastiCache implementations for production use.
import { handle } from 'hono/aws-lambda'
import { createApp } from './app'
import { createContainer } from './di/container'
import { MemoryCacheRepository } from './infrastructure/memory/memory-cache-repository'
import { MemoryUserRepository } from './infrastructure/memory/memory-user-repository'

const container = createContainer({
  userRepository: new MemoryUserRepository(),
  cacheRepository: new MemoryCacheRepository(),
})

const app = createApp(() => container)

export const handler = handle(app)
