import type { Context, Next } from 'hono'
import type { Bindings } from '../types'

export async function authMiddleware(c: Context<{ Bindings: Bindings }>, next: Next) {
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized: Missing token' }, 401)
  }
  
  const token = authHeader.slice(7)
  
  if (!c.env.ADMIN_TOKEN || token !== c.env.ADMIN_TOKEN) {
    return c.json({ error: 'Unauthorized: Invalid token' }, 401)
  }
  
  await next()
}
