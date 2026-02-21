import { Hono } from 'hono'
import type { Bindings } from '../types'

export const articleRoutes = new Hono<{ Bindings: Bindings }>()

// GET /api/articles - 获取文章列表
articleRoutes.get('/', async (c) => {
  const { type, category, tag, page = '1', limit = '12', status = 'published' } = c.req.query()
  const offset = (parseInt(page) - 1) * parseInt(limit)

  let conditions = [`a.status = ?`]
  const params: any[] = [status]

  if (type && (type === 'blog' || type === 'wiki')) {
    conditions.push(`a.type = ?`)
    params.push(type)
  }

  const whereClause = conditions.join(' AND ')

  // 需要按 tag 或 category 过滤时，先查出符合条件的 article_id
  let articleIds: number[] | null = null

  if (tag) {
    const tagResult = await c.env.DB.prepare(
      `SELECT at.article_id FROM article_tags at
       JOIN tags t ON at.tag_id = t.id WHERE t.slug = ?`
    ).bind(tag).all<{ article_id: number }>()
    articleIds = tagResult.results.map(r => r.article_id)
    if (articleIds.length === 0) return c.json({ results: [], total: 0, page: parseInt(page), limit: parseInt(limit) })
  }

  if (category) {
    const catResult = await c.env.DB.prepare(
      `SELECT ac.article_id FROM article_categories ac
       JOIN categories cat ON ac.category_id = cat.id WHERE cat.slug = ?`
    ).bind(category).all<{ article_id: number }>()
    const catIds = catResult.results.map(r => r.article_id)
    articleIds = articleIds ? articleIds.filter(id => catIds.includes(id)) : catIds
    if (articleIds.length === 0) return c.json({ results: [], total: 0, page: parseInt(page), limit: parseInt(limit) })
  }

  let idFilter = ''
  if (articleIds !== null) {
    idFilter = ` AND a.id IN (${articleIds.join(',')})`
  }

  const countResult = await c.env.DB.prepare(
    `SELECT COUNT(DISTINCT a.id) as total FROM articles a WHERE ${whereClause}${idFilter}`
  ).bind(...params).first<{ total: number }>()

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
  `).bind(...params, parseInt(limit), offset).all()

  return c.json({
    results: articles.results,
    total: countResult?.total ?? 0,
    page: parseInt(page),
    limit: parseInt(limit)
  })
})

// GET /api/articles/:slug - 获取单篇文章
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

  // 增加浏览计数（异步，不阻塞响应）
  c.executionCtx.waitUntil(
    c.env.DB.prepare(`UPDATE articles SET view_count = view_count + 1 WHERE slug = ?`)
      .bind(slug).run()
  )

  return c.json(article)
})
