import z from 'zod'

// HTTP contract schemas — used by routers for validation (hono-openapi
// validator) and OpenAPI spec generation. Keep in sync with domain entities.

export const userSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string(),
  createdAt: z.iso.datetime(),
})

export const createUserSchema = z.object({
  email: z.email(),
  name: z.string().min(1),
})

export const updateUserSchema = createUserSchema.partial()

export const idParamSchema = z.object({
  id: z.string().min(1),
})

export const userResponseSchema = z.object({ data: userSchema })
export const userListResponseSchema = z.object({ data: z.array(userSchema) })

export const errorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
})
