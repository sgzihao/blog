import { Hono } from 'hono'
import type { Bindings } from '../types'

export const taxonomyRoutes = new Hono<{ Bindings: Bindings }>()

// GET /api/tags
taxonomyRoutes.get('/tags', async (c) => {
  const tags = await c.env.DB.prepare(`
    SELECT t.id, t.name, t.slug, COUNT(at.article_id) as count
    FROM tags t
    LEFT JOIN article_tags at ON t.id = at.tag_id
    LEFT JOIN articles a ON at.article_id = a.id AND a.status = 'published'
    GROUP BY t.id
    ORDER BY count DESC, t.name ASC
  `).all()

  return c.json(tags.results)
})

// GET /api/categories
taxonomyRoutes.get('/categories', async (c) => {
  const categories = await c.env.DB.prepare(`
    SELECT cat.id, cat.name, cat.slug, cat.description, cat.color,
           COUNT(ac.article_id) as count
    FROM categories cat
    LEFT JOIN article_categories ac ON cat.id = ac.category_id
    LEFT JOIN articles a ON ac.article_id = a.id AND a.status = 'published'
    GROUP BY cat.id
    ORDER BY count DESC, cat.name ASC
  `).all()

  return c.json(categories.results)
})

// GET /api/tags (also handle /api/tags path separately)
taxonomyRoutes.get('/', async (c) => {
  // Route to correct handler based on URL prefix
  const path = c.req.path
  if (path.startsWith('/api/categories')) {
    const categories = await c.env.DB.prepare(`
      SELECT cat.id, cat.name, cat.slug, cat.description, cat.color,
             COUNT(ac.article_id) as count
      FROM categories cat
      LEFT JOIN article_categories ac ON cat.id = ac.category_id
      LEFT JOIN articles a ON ac.article_id = a.id AND a.status = 'published'
      GROUP BY cat.id
      ORDER BY count DESC
    `).all()
    return c.json(categories.results)
  }

  const tags = await c.env.DB.prepare(`
    SELECT t.id, t.name, t.slug, COUNT(at.article_id) as count
    FROM tags t
    LEFT JOIN article_tags at ON t.id = at.tag_id
    LEFT JOIN articles a ON at.article_id = a.id AND a.status = 'published'
    GROUP BY t.id
    ORDER BY count DESC
  `).all()

  return c.json(tags.results)
})
