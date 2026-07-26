import { Hono } from 'hono'
import { describeRoute, resolver, validator } from 'hono-openapi'
import {
  createUserSchema,
  errorResponseSchema,
  idParamSchema,
  updateUserSchema,
  userListResponseSchema,
  userResponseSchema,
} from '../schemas/user-schemas'
import type { AppEnv } from '../types'

const jsonContent = (schema: Parameters<typeof resolver>[0]) => ({
  'application/json': { schema: resolver(schema) },
})

export function createUserRouter() {
  const router = new Hono<AppEnv>()

  router.get(
    '/',
    describeRoute({
      tags: ['Users'],
      summary: 'List all users',
      responses: {
        200: { description: 'All users', content: jsonContent(userListResponseSchema) },
      },
    }),
    (c) => c.get('container').userHandler.list(c)
  )

  router.post(
    '/',
    describeRoute({
      tags: ['Users'],
      summary: 'Create a user',
      responses: {
        201: { description: 'User created', content: jsonContent(userResponseSchema) },
        400: { description: 'Invalid input', content: jsonContent(errorResponseSchema) },
        409: { description: 'Email already registered', content: jsonContent(errorResponseSchema) },
      },
    }),
    validator('json', createUserSchema),
    (c) => c.get('container').userHandler.create(c)
  )

  router.get(
    '/:id',
    describeRoute({
      tags: ['Users'],
      summary: 'Get a user by id',
      description: 'Cached in KV for 5 minutes.',
      responses: {
        200: { description: 'User found', content: jsonContent(userResponseSchema) },
        404: { description: 'User not found', content: jsonContent(errorResponseSchema) },
      },
    }),
    validator('param', idParamSchema),
    (c) => c.get('container').userHandler.get(c)
  )

  router.patch(
    '/:id',
    describeRoute({
      tags: ['Users'],
      summary: 'Update a user',
      responses: {
        200: { description: 'User updated', content: jsonContent(userResponseSchema) },
        400: { description: 'Invalid input', content: jsonContent(errorResponseSchema) },
        404: { description: 'User not found', content: jsonContent(errorResponseSchema) },
      },
    }),
    validator('param', idParamSchema),
    validator('json', updateUserSchema),
    (c) => c.get('container').userHandler.update(c)
  )

  router.delete(
    '/:id',
    describeRoute({
      tags: ['Users'],
      summary: 'Delete a user',
      responses: {
        204: { description: 'User deleted' },
        404: { description: 'User not found', content: jsonContent(errorResponseSchema) },
      },
    }),
    validator('param', idParamSchema),
    (c) => c.get('container').userHandler.delete(c)
  )

  return router
}
