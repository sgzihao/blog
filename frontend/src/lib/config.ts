// Centralized site configuration — reads from environment variables with sensible defaults.
// To customize, edit .env (production) or .env.local (local dev).

export const siteConfig = {
  name: import.meta.env.PUBLIC_SITE_NAME || 'TechBlog',
  description: import.meta.env.PUBLIC_SITE_DESCRIPTION || 'Tech & AI Knowledge Base',
  emoji: import.meta.env.PUBLIC_SITE_EMOJI || '🤖',
  heroTitle: import.meta.env.PUBLIC_HERO_TITLE || import.meta.env.PUBLIC_SITE_NAME || 'TechBlog',
  heroSubtitle: import.meta.env.PUBLIC_HERO_SUBTITLE || 'A personal tech knowledge base.',
  author: import.meta.env.PUBLIC_AUTHOR || 'Author',
  github: import.meta.env.PUBLIC_AUTHOR_GITHUB || '',
  twitter: import.meta.env.PUBLIC_AUTHOR_TWITTER || '',
}
