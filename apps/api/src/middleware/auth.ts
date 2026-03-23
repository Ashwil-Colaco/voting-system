import { getAuth } from '@hono/clerk-auth'
import { createMiddleware } from 'hono/factory'
import type { AppEnv } from '../types'

export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  const auth = getAuth(c)
  
  if (!auth?.userId) {
    return c.json({ success: false, error: 'Unauthorized' }, 401)
  }
  
  c.set('userId', auth.userId)
  await next()
})
