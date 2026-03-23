import { Hono } from 'hono'
import type { AppEnv } from '../types'
import { requireAuth } from '../middleware/auth'

const health = new Hono<AppEnv>()

//test route
health.get('/', requireAuth, (c) => {
  const userId = c.get('userId')
  return c.json({ 
    success: true, 
    data: { 
      message: 'Hello World', 
      userId 
    } 
  })
})

export default health
