export type Bindings = {
  DB: D1Database
  ADMIN_TOKEN: string
  ALLOWED_ORIGIN: string
}

export type ArticleType = 'blog' | 'wiki'
export type ArticleStatus = 'published' | 'draft'

export interface Article {
  id: number
  slug: string
  title: string
  content: string
  excerpt: string | null
  type: ArticleType
  status: ArticleStatus
  cover_image: string | null
  view_count: number
  created_at: string
  updated_at: string
  tags?: string | null
  tag_slugs?: string | null
  categories?: string | null
  category_slugs?: string | null
}

export interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  color: string
  created_at: string
  count?: number
}

export interface Tag {
  id: number
  name: string
  slug: string
  created_at: string
  count?: number
}

export interface ArticleInput {
  slug: string
  title: string
  content: string
  excerpt?: string
  type: ArticleType
  status: ArticleStatus
  cover_image?: string
  category_ids?: number[]
  tag_ids?: number[]
}
