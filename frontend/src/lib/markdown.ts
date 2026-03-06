// src/lib/markdown.ts - Markdown renderer with syntax highlighting

import { marked } from 'marked'
import { markedHighlight } from 'marked-highlight'
import hljs from 'highlight.js'
import DOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'

const window = new JSDOM('').window
const purify = DOMPurify(window as any)

// Configure syntax highlighting
marked.use(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext'
      return hljs.highlight(code, { language }).value
    },
  })
)

// Custom renderer
const renderer = new marked.Renderer()

// Open external links in a new tab, block dangerous protocols
renderer.link = ({ href, title, text }) => {
  if (href && /^\s*(javascript|data|vbscript):/i.test(href)) {
    return String(text)
  }
  const isExternal = href && (href.startsWith('http://') || href.startsWith('https://'))
  const target = isExternal ? ' target="_blank" rel="noopener noreferrer"' : ''
  const titleAttr = title ? ` title="${title}"` : ''
  return `<a href="${href}"${titleAttr}${target}>${text}</a>`
}

// Enable image lazy loading
renderer.image = ({ href, title, text }) => {
  const titleAttr = title ? ` title="${title}"` : ''
  return `<img src="${href}" alt="${text}"${titleAttr} loading="lazy" class="rounded-lg max-w-full" />`
}

// Add heading IDs for anchor navigation
renderer.heading = (token: any) => {
  const depth = typeof token?.depth === 'number' ? token.depth : 2
  const headingText = String(token?.text ?? token?.raw ?? '').replace(/^#+\s*/, '').trim()
  const headingHtml = token?.tokens ? (renderer.parser?.parseInline(token.tokens) || headingText) : headingText
  const id = headingText
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fff\s\-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
  const safeId = id || 'section'
  return `<h${depth} id="${safeId}" class="heading-with-anchor"><a class="heading-anchor" href="#${safeId}" aria-label="Link to this section">#</a>${headingHtml}</h${depth}>`
}

marked.use({ renderer })

marked.setOptions({
  gfm: true,      // GitHub Flavored Markdown
  breaks: false,
})

export function renderMarkdown(content: string): string {
  try {
    const raw = marked(content) as string
    return purify.sanitize(raw, {
      ADD_ATTR: ['target', 'rel', 'loading', 'aria-label'],
      ADD_TAGS: ['mark'],
    })
  } catch (e) {
    console.error('Markdown render error:', e)
    return `<p>${purify.sanitize(content)}</p>`
  }
}

// Extract table of contents
export function extractToc(content: string): Array<{ id: string; text: string; level: number }> {
  const headings: Array<{ id: string; text: string; level: number }> = []
  const regex = /^(#{1,3})\s+(.+)$/gm
  let match

  while ((match = regex.exec(content)) !== null) {
    const level = match[1].length
    const text = match[2].replace(/[*_`]/g, '').trim()
    const id = text.toLowerCase().replace(/[^\w\u4e00-\u9fff\-]/g, '-').replace(/-+/g, '-')
    headings.push({ id, text, level })
  }

  return headings
}
