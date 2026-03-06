import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { articleRoutes } from './routes/articles'
import { adminRoutes } from './routes/admin'
import { uploadRoutes } from './routes/upload'
import { searchRoutes } from './routes/search'
import { taxonomyRoutes } from './routes/taxonomy'
import type { Bindings } from './types'

const app = new Hono<{ Bindings: Bindings }>()

// ==================== Middleware ====================
app.use('*', logger())

app.use('*', async (c, next) => {
  const configuredOrigins = (c.env.ALLOWED_ORIGIN || '*')
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean)

  const allowAll = configuredOrigins.includes('*')
  const allowedOrigins = Array.from(new Set([
    ...configuredOrigins,
    'http://localhost:4321',
    'http://localhost:3000',
  ]))

  const isAllowedOrigin = (origin: string) => {
    if (allowAll) return true
    return allowedOrigins.some((allowed) => {
      if (!allowed.includes('*')) return origin === allowed
      const pattern = allowed
        .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
        .replace(/\*/g, '.*')
      return new RegExp(`^${pattern}$`).test(origin)
    })
  }

  return cors({
    origin: (origin) => {
      if (allowAll) return '*'
      if (!origin) return ''
      return isAllowedOrigin(origin) ? origin : ''
    },
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  })(c, next)
})

// ==================== Health Check ====================
app.get('/', (c) => c.json({
  status: 'ok',
  service: 'TechBlog API',
  version: '1.0.0',
  timestamp: new Date().toISOString()
}))

// ==================== Route Mounting ====================
app.route('/api/articles', articleRoutes)
app.route('/api/search', searchRoutes)
app.route('/api/tags', taxonomyRoutes)
app.route('/api/categories', taxonomyRoutes)
app.route('/api/admin', adminRoutes)
app.route('/api', uploadRoutes)   // mounts /api/media/:id and /api/upload/image

// ==================== 404 Handler ====================
app.notFound((c) => c.json({ error: 'Not Found', path: c.req.path }, 404))

// ==================== Error Handler ====================
app.onError((err, c) => {
  console.error(`Error: ${err.message}`, err.stack)
  return c.json({
    error: 'Internal Server Error',
    message: err.message
  }, 500)
})

export default app
