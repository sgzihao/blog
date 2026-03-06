import { Hono } from 'hono'
import type { Bindings } from '../types'

export const articleRoutes = new Hono<{ Bindings: Bindings }>()

// GET /api/articles - Get article list
articleRoutes.get('/', async (c) => {
  const { type, category, tag, page = '1', limit = '12', status = 'published' } = c.req.query()
  const parsedLimit = Math.min(Math.max(1, parseInt(limit) || 12), 100)
  const offset = (parseInt(page) - 1) * parsedLimit

  let conditions = [`a.status = ?`]
  const params: any[] = [status]

  if (type && (type === 'blog' || type === 'wiki')) {
    conditions.push(`a.type = ?`)
    params.push(type)
  }

  const whereClause = conditions.join(' AND ')

  // When filtering by tag or category, first get matching article_ids
  let articleIds: number[] | null = null

  if (tag) {
    const tagResult = await c.env.DB.prepare(
      `SELECT at.article_id FROM article_tags at
       JOIN tags t ON at.tag_id = t.id WHERE t.slug = ?`
    ).bind(tag).all<{ article_id: number }>()
    articleIds = tagResult.results.map(r => r.article_id)
    if (articleIds.length === 0) return c.json({ results: [], total: 0, page: parseInt(page), limit: parsedLimit })
  }

  if (category) {
    const catResult = await c.env.DB.prepare(
      `SELECT ac.article_id FROM article_categories ac
       JOIN categories cat ON ac.category_id = cat.id WHERE cat.slug = ?`
    ).bind(category).all<{ article_id: number }>()
    const catIds = catResult.results.map(r => r.article_id)
    articleIds = articleIds ? articleIds.filter(id => catIds.includes(id)) : catIds
    if (articleIds.length === 0) return c.json({ results: [], total: 0, page: parseInt(page), limit: parsedLimit })
  }

  let idFilter = ''
  let idParams: number[] = []
  if (articleIds !== null) {
    const placeholders = articleIds.map(() => '?').join(',')
    idFilter = ` AND a.id IN (${placeholders})`
    idParams = articleIds
  }

  const countResult = await c.env.DB.prepare(
    `SELECT COUNT(DISTINCT a.id) as total FROM articles a WHERE ${whereClause}${idFilter}`
  ).bind(...params, ...idParams).first<{ total: number }>()

  const articles = await c.env.DB.prepare(`
    SELECT 
      a.id, a.slug, a.title, a.excerpt, a.type, a.status,
      a.cover_image, a.view_count, a.created_at, a.updated_at,
      GROUP_CONCAT(DISTINCT t.name) as tags,
      GROUP_CONCAT(DISTINCT t.slug) as tag_slugs,
      GROUP_CONCAT(DISTINCT cat.name) as categories,
      GROUP_CONCAT(DISTINCT cat.slug) as category_slugs
    FROM articles a
    LEFT JOIN article_tags art ON a.id = art.article_id
    LEFT JOIN tags t ON art.tag_id = t.id
    LEFT JOIN article_categories ac ON a.id = ac.article_id
    LEFT JOIN categories cat ON ac.category_id = cat.id
    WHERE ${whereClause}${idFilter}
    GROUP BY a.id
    ORDER BY a.created_at DESC
    LIMIT ? OFFSET ?
  `).bind(...params, ...idParams, parsedLimit, offset).all()

  return c.json({
    results: articles.results,
    total: countResult?.total ?? 0,
    page: parseInt(page),
    limit: parsedLimit
  })
})

// GET /api/articles/:slug - Get single article
articleRoutes.get('/:slug', async (c) => {
  const slug = c.req.param('slug')

  const article = await c.env.DB.prepare(`
    SELECT 
      a.*,
      GROUP_CONCAT(DISTINCT t.name) as tags,
      GROUP_CONCAT(DISTINCT t.slug) as tag_slugs,
      GROUP_CONCAT(DISTINCT cat.name) as categories,
      GROUP_CONCAT(DISTINCT cat.slug) as category_slugs,
      GROUP_CONCAT(DISTINCT cat.id) as category_ids,
      GROUP_CONCAT(DISTINCT t.id) as tag_id_list
    FROM articles a
    LEFT JOIN article_tags art ON a.id = art.article_id
    LEFT JOIN tags t ON art.tag_id = t.id
    LEFT JOIN article_categories ac ON a.id = ac.article_id
    LEFT JOIN categories cat ON ac.category_id = cat.id
    WHERE a.slug = ?
    GROUP BY a.id
  `).bind(slug).first()

  if (!article) return c.json({ error: 'Article not found' }, 404)

  // Increment view count (async, non-blocking)
  c.executionCtx.waitUntil(
    c.env.DB.prepare(`UPDATE articles SET view_count = view_count + 1 WHERE slug = ?`)
      .bind(slug).run()
  )

  return c.json(article)
})
