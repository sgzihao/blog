import { Hono } from 'hono'
import type { Bindings } from '../types'

export const searchRoutes = new Hono<{ Bindings: Bindings }>()

// GET /api/search?q=关键词&type=blog
searchRoutes.get('/', async (c) => {
  const { q, type, limit = '20' } = c.req.query()

  if (!q || q.trim().length === 0) {
    return c.json({ results: [], query: '' })
  }

  const query = q.trim()

  // FTS5 查询：支持前缀匹配
  // 将每个词加上 * 支持前缀搜索
  const ftsQuery = query.split(/\s+/).map(w => `"${w}"*`).join(' OR ')

  let typeFilter = ''
  const params: any[] = [ftsQuery, 'published']

  if (type && (type === 'blog' || type === 'wiki')) {
    typeFilter = ' AND a.type = ?'
    params.push(type)
  }

  params.push(parseInt(limit))

  try {
    const results = await c.env.DB.prepare(`
      SELECT 
        a.slug, a.title, a.excerpt, a.type, a.cover_image, a.created_at,
        snippet(articles_fts, 1, '<mark>', '</mark>', '...', 24) as highlight
      FROM articles_fts
      JOIN articles a ON articles_fts.rowid = a.id
      WHERE articles_fts MATCH ? AND a.status = ?${typeFilter}
      ORDER BY rank
      LIMIT ?
    `).bind(...params).all()

    return c.json({ results: results.results, query })
  } catch (e) {
    // FTS 查询失败时降级到 LIKE 搜索
    const likeQuery = `%${query}%`
    const fallbackParams: any[] = [likeQuery, likeQuery, 'published']
    if (type) fallbackParams.push(type)
    fallbackParams.push(parseInt(limit))

    const results = await c.env.DB.prepare(`
      SELECT slug, title, excerpt, type, cover_image, created_at
      FROM articles
      WHERE (title LIKE ? OR content LIKE ?) AND status = ?
      ${type ? 'AND type = ?' : ''}
      ORDER BY created_at DESC
      LIMIT ?
    `).bind(...fallbackParams).all()

    return c.json({ results: results.results, query, fallback: true })
  }
})
