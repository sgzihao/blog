import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import type { Bindings } from '../types'

export const uploadRoutes = new Hono<{ Bindings: Bindings }>()

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
const MAX_SIZE = 2 * 1024 * 1024 // 2MB（D1 行大小限制，Base64 膨胀约 1.33x）

// ==================== 公开接口：提供图片 ====================

// GET /api/media/:id - 直接返回图片二进制（浏览器可直接显示）
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

// ==================== 管理接口：上传图片（需认证）====================

// POST /api/upload/image - 上传图片，存入 D1
uploadRoutes.post('/upload/image', authMiddleware, async (c) => {
  const formData = await c.req.formData()
  const file = formData.get('file') as File | null

  if (!file) return c.json({ error: 'No file provided' }, 400)

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return c.json({ error: `不支持的文件类型：${file.type}` }, 400)
  }

  if (file.size > MAX_SIZE) {
    return c.json({ error: `文件过大，最大 ${MAX_SIZE / 1024 / 1024}MB` }, 400)
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

// DELETE /api/upload/media/:id - 删除图片
uploadRoutes.delete('/upload/media/:id', authMiddleware, async (c) => {
  const id = c.req.param('id')
  const result = await c.env.DB.prepare(`DELETE FROM media WHERE id = ?`).bind(id).run()
  if (result.meta.changes === 0) return c.json({ error: 'Not found' }, 404)
  return c.json({ success: true })
})
