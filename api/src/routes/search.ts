import { Hono } from 'hono'
import type { Bindings } from '../types'

export const searchRoutes = new Hono<{ Bindings: Bindings }>()

// GET /api/search?q=keyword&type=blog
searchRoutes.get('/', async (c) => {
  const { q, type, limit = '20' } = c.req.query()
  const parsedLimit = Math.min(Math.max(1, parseInt(limit) || 20), 50)

  if (!q || q.trim().length === 0) {
    return c.json({ results: [], query: '' })
  }

  const query = q.trim()

  // FTS5 query: supports prefix matching
  // Add * to each word for prefix search
  const ftsQuery = query.split(/\s+/).map(w => `"${w}"*`).join(' OR ')

  let typeFilter = ''
  const params: any[] = [ftsQuery, 'published']

  if (type && (type === 'blog' || type === 'wiki')) {
    typeFilter = ' AND a.type = ?'
    params.push(type)
  }

  params.push(parsedLimit)

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
    // Fallback to LIKE search when FTS query fails
    const likeQuery = `%${query}%`
    const fallbackParams: any[] = [likeQuery, likeQuery, 'published']
    if (type) fallbackParams.push(type)
    fallbackParams.push(parsedLimit)

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
