// src/lib/api.ts - API 客户端工具

const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:8787'

export interface Article {
  id: number
  slug: string
  title: string
  content: string
  excerpt: string | null
  type: 'blog' | 'wiki'
  status: 'published' | 'draft'
  cover_image: string | null
  view_count: number
  created_at: string
  updated_at: string
  tags?: string | null
  tag_slugs?: string | null
  categories?: string | null
  category_slugs?: string | null
  category_ids?: string | null
  tag_id_list?: string | null
}

export interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  color: string
  count: number
}

export interface Tag {
  id: number
  name: string
  slug: string
  count: number
}

export interface PaginatedResult<T> {
  results: T[]
  total: number
  page: number
  limit: number
}

export interface SearchResult {
  slug: string
  title: string
  excerpt: string | null
  type: 'blog' | 'wiki'
  cover_image: string | null
  created_at: string
  highlight?: string
}

// ==================== 公开接口 ====================

export async function getArticles(params: {
  type?: 'blog' | 'wiki'
  category?: string
  tag?: string
  page?: number
  limit?: number
  status?: string
}): Promise<PaginatedResult<Article>> {
  const query = new URLSearchParams()
  if (params.type) query.set('type', params.type)
  if (params.category) query.set('category', params.category)
  if (params.tag) query.set('tag', params.tag)
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  if (params.status) query.set('status', params.status)

  const res = await fetch(`${API_URL}/api/articles?${query}`)
  if (!res.ok) throw new Error(`Failed to fetch articles: ${res.status}`)
  return res.json()
}

export async function getArticle(slug: string): Promise<Article> {
  const res = await fetch(`${API_URL}/api/articles/${slug}`)
  if (!res.ok) throw new Error(`Article not found: ${slug}`)
  return res.json()
}

export async function searchArticles(q: string, type?: string): Promise<{ results: SearchResult[], query: string }> {
  const query = new URLSearchParams({ q })
  if (type) query.set('type', type)
  const res = await fetch(`${API_URL}/api/search?${query}`)
  return res.json()
}

export async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${API_URL}/api/categories`)
  return res.json()
}

export async function getTags(): Promise<Tag[]> {
  const res = await fetch(`${API_URL}/api/tags`)
  return res.json()
}

// ==================== 管理接口 ====================

function adminHeaders(token: string) {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  }
}

export async function adminGetArticles(token: string, params?: { type?: string, status?: string, page?: number }): Promise<PaginatedResult<Article>> {
  const query = new URLSearchParams()
  if (params?.type) query.set('type', params.type)
  if (params?.status) query.set('status', params.status)
  if (params?.page) query.set('page', String(params.page))
  query.set('limit', '50')

  const res = await fetch(`${API_URL}/api/admin/articles?${query}`, {
    headers: adminHeaders(token)
  })
  if (!res.ok) throw new Error('Auth failed or server error')
  return res.json()
}

export async function adminCreateArticle(token: string, data: Partial<Article> & { category_ids?: number[], tag_ids?: number[] }): Promise<{ success: boolean, id: number, slug: string }> {
  const res = await fetch(`${API_URL}/api/admin/articles`, {
    method: 'POST',
    headers: adminHeaders(token),
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json() as { error: string }
    throw new Error(err.error || 'Create failed')
  }
  return res.json()
}

export async function adminUpdateArticle(token: string, slug: string, data: Partial<Article> & { category_ids?: number[], tag_ids?: number[] }): Promise<{ success: boolean }> {
  const res = await fetch(`${API_URL}/api/admin/articles/${slug}`, {
    method: 'PUT',
    headers: adminHeaders(token),
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json() as { error: string }
    throw new Error(err.error || 'Update failed')
  }
  return res.json()
}

export async function adminDeleteArticle(token: string, slug: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/admin/articles/${slug}`, {
    method: 'DELETE',
    headers: adminHeaders(token),
  })
  if (!res.ok) throw new Error('Delete failed')
}

export async function adminGetStats(token: string) {
  const res = await fetch(`${API_URL}/api/admin/stats`, {
    headers: adminHeaders(token)
  })
  return res.json()
}

export async function adminCreateCategory(token: string, data: { name: string, slug: string, description?: string, color?: string }) {
  const res = await fetch(`${API_URL}/api/admin/categories`, {
    method: 'POST',
    headers: adminHeaders(token),
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function adminCreateTag(token: string, data: { name: string, slug: string }) {
  const res = await fetch(`${API_URL}/api/admin/tags`, {
    method: 'POST',
    headers: adminHeaders(token),
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function uploadImage(token: string, file: File): Promise<{ url: string, id: number }> {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`${API_URL}/api/upload/image`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  })
  if (!res.ok) {
    const err = await res.json() as { error: string }
    throw new Error(err.error || 'Upload failed')
  }
  const data = await res.json() as { url: string, id: number }
  // 将相对路径转为绝对路径（让图片在前端可以正常显示）
  const absoluteUrl = data.url.startsWith('http') ? data.url : `${API_URL}${data.url}`
  return { ...data, url: absoluteUrl }
}

// ==================== 工具函数 ====================

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\w\-\u4e00-\u9fff]+/g, '')
    .replace(/^-+|-+$/g, '')
}

export function splitComma(str: string | null | undefined): string[] {
  if (!str) return []
  return str.split(',').filter(Boolean)
}
