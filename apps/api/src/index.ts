import { Hono } from 'hono'
import { clerkMiddleware } from '@hono/clerk-auth'
import type { AppEnv } from './types'

import voteRoutes from './routes/vote.route'
import healthRoutes from './routes/health.route'

const app = new Hono<AppEnv>()

const port = 8000;

//using clerk middleware
app.use('*', clerkMiddleware())

//protected api group
const api = app.basePath('/api/v1')

api.route('/vote', voteRoutes)
api.route('/health', healthRoutes)

export default {
  port,
  fetch: app.fetch,
}
