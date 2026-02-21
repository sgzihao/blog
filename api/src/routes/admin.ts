import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import type { Bindings, ArticleInput } from '../types'

export const adminRoutes = new Hono<{ Bindings: Bindings }>()

// 所有管理接口都需要认证
adminRoutes.use('*', authMiddleware)

// ==================== 文章管理 ====================

// GET /api/admin/articles - 获取所有文章（包括草稿）
adminRoutes.get('/articles', async (c) => {
  const { type, status, page = '1', limit = '20' } = c.req.query()
  const offset = (parseInt(page) - 1) * parseInt(limit)

  let conditions: string[] = []
  const params: any[] = []

  if (type) { conditions.push('a.type = ?'); params.push(type) }
  if (status) { conditions.push('a.status = ?'); params.push(status) }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  const [countResult, articles] = await Promise.all([
    c.env.DB.prepare(`SELECT COUNT(*) as total FROM articles a ${whereClause}`).bind(...params).first<{ total: number }>(),
    c.env.DB.prepare(`
      SELECT a.id, a.slug, a.title, a.excerpt, a.type, a.status,
             a.cover_image, a.view_count, a.created_at, a.updated_at,
             GROUP_CONCAT(DISTINCT t.name) as tags,
             GROUP_CONCAT(DISTINCT cat.name) as categories
      FROM articles a
      LEFT JOIN article_tags art ON a.id = art.article_id
      LEFT JOIN tags t ON art.tag_id = t.id
      LEFT JOIN article_categories ac ON a.id = ac.article_id
      LEFT JOIN categories cat ON ac.category_id = cat.id
      ${whereClause}
      GROUP BY a.id
      ORDER BY a.updated_at DESC
      LIMIT ? OFFSET ?
    `).bind(...params, parseInt(limit), offset).all()
  ])

  return c.json({
    results: articles.results,
    total: countResult?.total ?? 0,
    page: parseInt(page),
    limit: parseInt(limit)
  })
})

// POST /api/admin/articles - 创建文章
adminRoutes.post('/articles', async (c) => {
  const body = await c.req.json<ArticleInput>()
  const { slug, title, content, excerpt, type = 'blog', status = 'draft', cover_image, category_ids = [], tag_ids = [] } = body

  if (!slug || !title || !content) {
    return c.json({ error: 'Missing required fields: slug, title, content' }, 400)
  }

  // 检查 slug 是否已存在
  const existing = await c.env.DB.prepare(`SELECT id FROM articles WHERE slug = ?`).bind(slug).first()
  if (existing) {
    return c.json({ error: 'Slug already exists' }, 409)
  }

  const result = await c.env.DB.prepare(`
    INSERT INTO articles (slug, title, content, excerpt, type, status, cover_image)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(slug, title, content, excerpt || null, type, status, cover_image || null).run()

  const articleId = result.meta.last_row_id

  await updateRelations(c.env.DB, articleId as number, category_ids, tag_ids)

  return c.json({ success: true, id: articleId, slug }, 201)
})

// PUT /api/admin/articles/:slug - 更新文章
adminRoutes.put('/articles/:slug', async (c) => {
  const slug = c.req.param('slug')
  const body = await c.req.json<Partial<ArticleInput>>()

  const article = await c.env.DB.prepare(`SELECT id FROM articles WHERE slug = ?`).bind(slug).first<{ id: number }>()
  if (!article) return c.json({ error: 'Article not found' }, 404)

  const { title, content, excerpt, type, status, cover_image, category_ids, tag_ids } = body

  // 动态构建更新语句
  const updates: string[] = []
  const params: any[] = []

  if (title !== undefined) { updates.push('title = ?'); params.push(title) }
  if (content !== undefined) { updates.push('content = ?'); params.push(content) }
  if (excerpt !== undefined) { updates.push('excerpt = ?'); params.push(excerpt) }
  if (type !== undefined) { updates.push('type = ?'); params.push(type) }
  if (status !== undefined) { updates.push('status = ?'); params.push(status) }
  if (cover_image !== undefined) { updates.push('cover_image = ?'); params.push(cover_image || null) }

  if (updates.length > 0) {
    params.push(slug)
    await c.env.DB.prepare(
      `UPDATE articles SET ${updates.join(', ')} WHERE slug = ?`
    ).bind(...params).run()
  }

  if (category_ids !== undefined || tag_ids !== undefined) {
    await updateRelations(
      c.env.DB, 
      article.id,
      category_ids ?? [],
      tag_ids ?? []
    )
  }

  return c.json({ success: true, slug })
})

// DELETE /api/admin/articles/:slug - 删除文章
adminRoutes.delete('/articles/:slug', async (c) => {
  const slug = c.req.param('slug')
  const result = await c.env.DB.prepare(`DELETE FROM articles WHERE slug = ?`).bind(slug).run()
  
  if (result.meta.changes === 0) {
    return c.json({ error: 'Article not found' }, 404)
  }

  return c.json({ success: true })
})

// ==================== 分类管理 ====================

adminRoutes.post('/categories', async (c) => {
  const { name, slug, description, color } = await c.req.json()
  if (!name || !slug) return c.json({ error: 'Missing name or slug' }, 400)

  const result = await c.env.DB.prepare(
    `INSERT INTO categories (name, slug, description, color) VALUES (?, ?, ?, ?)`
  ).bind(name, slug, description || null, color || '#6366f1').run()

  return c.json({ success: true, id: result.meta.last_row_id }, 201)
})

adminRoutes.put('/categories/:id', async (c) => {
  const id = c.req.param('id')
  const { name, slug, description, color } = await c.req.json()

  await c.env.DB.prepare(
    `UPDATE categories SET name=?, slug=?, description=?, color=? WHERE id=?`
  ).bind(name, slug, description || null, color || '#6366f1', id).run()

  return c.json({ success: true })
})

adminRoutes.delete('/categories/:id', async (c) => {
  const id = c.req.param('id')
  await c.env.DB.prepare(`DELETE FROM categories WHERE id = ?`).bind(id).run()
  return c.json({ success: true })
})

// ==================== 标签管理 ====================

adminRoutes.post('/tags', async (c) => {
  const { name, slug } = await c.req.json()
  if (!name || !slug) return c.json({ error: 'Missing name or slug' }, 400)

  const result = await c.env.DB.prepare(
    `INSERT INTO tags (name, slug) VALUES (?, ?)`
  ).bind(name, slug).run()

  return c.json({ success: true, id: result.meta.last_row_id }, 201)
})

adminRoutes.delete('/tags/:id', async (c) => {
  const id = c.req.param('id')
  await c.env.DB.prepare(`DELETE FROM tags WHERE id = ?`).bind(id).run()
  return c.json({ success: true })
})

// ==================== 统计信息 ====================

adminRoutes.get('/stats', async (c) => {
  const [totalArticles, publishedArticles, totalViews, totalTags, totalCategories] = await Promise.all([
    c.env.DB.prepare(`SELECT COUNT(*) as count FROM articles`).first<{ count: number }>(),
    c.env.DB.prepare(`SELECT COUNT(*) as count FROM articles WHERE status = 'published'`).first<{ count: number }>(),
    c.env.DB.prepare(`SELECT COALESCE(SUM(view_count), 0) as total FROM articles`).first<{ total: number }>(),
    c.env.DB.prepare(`SELECT COUNT(*) as count FROM tags`).first<{ count: number }>(),
    c.env.DB.prepare(`SELECT COUNT(*) as count FROM categories`).first<{ count: number }>(),
  ])

  return c.json({
    total_articles: totalArticles?.count ?? 0,
    published_articles: publishedArticles?.count ?? 0,
    draft_articles: (totalArticles?.count ?? 0) - (publishedArticles?.count ?? 0),
    total_views: totalViews?.total ?? 0,
    total_tags: totalTags?.count ?? 0,
    total_categories: totalCategories?.count ?? 0,
  })
})

// ==================== 辅助函数 ====================

async function updateRelations(db: D1Database, articleId: number, categoryIds: number[], tagIds: number[]) {
  // 清除旧关联
  await db.prepare(`DELETE FROM article_categories WHERE article_id = ?`).bind(articleId).run()
  await db.prepare(`DELETE FROM article_tags WHERE article_id = ?`).bind(articleId).run()

  // 批量插入新关联
  const stmts: D1PreparedStatement[] = []

  for (const catId of categoryIds) {
    stmts.push(db.prepare(`INSERT OR IGNORE INTO article_categories VALUES (?, ?)`).bind(articleId, catId))
  }
  for (const tagId of tagIds) {
    stmts.push(db.prepare(`INSERT OR IGNORE INTO article_tags VALUES (?, ?)`).bind(articleId, tagId))
  }

  if (stmts.length > 0) {
    await db.batch(stmts)
  }
}
