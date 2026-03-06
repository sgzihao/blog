import rss from '@astrojs/rss'
import type { APIContext } from 'astro'
import { getArticlesSafe } from '../lib/api'

export async function GET(context: APIContext) {
  const siteName = import.meta.env.PUBLIC_SITE_NAME || 'TechBlog'
  const siteDescription = import.meta.env.PUBLIC_SITE_DESCRIPTION || 'Tech & AI Knowledge Base'

  const articles = await getArticlesSafe({ limit: 50 })

  return rss({
    title: siteName,
    description: siteDescription,
    site: context.site!,
    items: articles.results.map((article) => ({
      title: article.title,
      pubDate: new Date(article.created_at),
      description: article.excerpt || '',
      link: `/${article.type}/post?slug=${article.slug}`,
    })),
  })
}
