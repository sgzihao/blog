import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import type { Bindings } from '../types'

export const uploadRoutes = new Hono<{ Bindings: Bindings }>()

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
const MAX_SIZE = 2 * 1024 * 1024 // 2MB (D1 row size limit, Base64 inflates ~1.33x)

// ==================== Public Endpoint: Serve Images ====================

// GET /api/media/:id - Return image binary directly (browser can render it)
uploadRoutes.get('/media/:id', async (c) => {
  const id = c.req.param('id')

  const row = await c.env.DB.prepare(
    `SELECT data, mime_type FROM media WHERE id = ?`
  ).bind(id).first<{ data: string; mime_type: string }>()

  if (!row) return c.json({ error: 'Not found' }, 404)

  const binary = Uint8Array.from(atob(row.data), ch => ch.charCodeAt(0))

  return new Response(binary, {
    headers: {
      'Content-Type': row.mime_type,
      'Cache-Control': 'public, max-age=31536000',
    },
  })
})

// ==================== Admin Endpoint: Upload Image (auth required) ====================

// POST /api/upload/image - Upload image, store in D1
uploadRoutes.post('/upload/image', authMiddleware, async (c) => {
  const formData = await c.req.formData()
  const file = formData.get('file') as File | null

  if (!file) return c.json({ error: 'No file provided' }, 400)

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return c.json({ error: `Unsupported file type: ${file.type}` }, 400)
  }

  if (file.size > MAX_SIZE) {
    return c.json({ error: `File too large. Max ${MAX_SIZE / 1024 / 1024}MB` }, 400)
  }

  try {
    const buffer = await file.arrayBuffer()
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)))

    const result = await c.env.DB.prepare(
      `INSERT INTO media (mime_type, original_name, data, size, created_at)
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`
    ).bind(file.type, file.name, base64, file.size).run()

    const id = result.meta.last_row_id
    const url = `/api/media/${id}`

    return c.json({ success: true, url, id })
  } catch (e) {
    console.error('Upload failed:', e)
    return c.json({ error: 'Upload failed' }, 500)
  }
})

// DELETE /api/upload/media/:id - Delete image
uploadRoutes.delete('/upload/media/:id', authMiddleware, async (c) => {
  const id = c.req.param('id')
  const result = await c.env.DB.prepare(`DELETE FROM media WHERE id = ?`).bind(id).run()
  if (result.meta.changes === 0) return c.json({ error: 'Not found' }, 404)
  return c.json({ success: true })
})
