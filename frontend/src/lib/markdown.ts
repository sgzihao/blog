// src/lib/markdown.ts - Markdown renderer with syntax highlighting

import { marked } from 'marked'
import { markedHighlight } from 'marked-highlight'
import hljs from 'highlight.js'

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

// Open external links in a new tab
renderer.link = ({ href, title, text }) => {
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
  const id = headingText
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fff\-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
  const safeId = id || 'section'
  return `<h${depth} id="${safeId}">${headingText}</h${depth}>`
}

marked.use({ renderer })

marked.setOptions({
  gfm: true,      // GitHub Flavored Markdown
  breaks: false,
})

export function renderMarkdown(content: string): string {
  try {
    return marked(content) as string
  } catch (e) {
    console.error('Markdown render error:', e)
    return `<p>${content}</p>`
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
