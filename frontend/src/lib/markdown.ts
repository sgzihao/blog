// src/lib/markdown.ts - Markdown 渲染器（带代码高亮）

import { marked } from 'marked'
import { markedHighlight } from 'marked-highlight'
import hljs from 'highlight.js'

// 配置代码高亮
marked.use(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext'
      return hljs.highlight(code, { language }).value
    },
  })
)

// 自定义渲染器
const renderer = new marked.Renderer()

// 链接在新标签页打开（外部链接）
renderer.link = ({ href, title, text }) => {
  const isExternal = href && (href.startsWith('http://') || href.startsWith('https://'))
  const target = isExternal ? ' target="_blank" rel="noopener noreferrer"' : ''
  const titleAttr = title ? ` title="${title}"` : ''
  return `<a href="${href}"${titleAttr}${target}>${text}</a>`
}

// 图片懒加载
renderer.image = ({ href, title, text }) => {
  const titleAttr = title ? ` title="${title}"` : ''
  return `<img src="${href}" alt="${text}"${titleAttr} loading="lazy" class="rounded-lg max-w-full" />`
}

// 标题添加 ID（用于锚点导航）
renderer.heading = ({ text, depth }) => {
  const id = text.toLowerCase().replace(/[^\w\u4e00-\u9fff\-]/g, '-').replace(/-+/g, '-')
  return `<h${depth} id="${id}">${text}</h${depth}>`
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

// 提取文章目录
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
