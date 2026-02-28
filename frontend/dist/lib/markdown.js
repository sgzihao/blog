// Browser-safe markdown renderer for runtime pages.
// Keeps output simple and predictable for blog/wiki/admin previews.

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function escapeAttr(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
}

function inlineMarkdown(text) {
  let out = escapeHtml(text)
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>')
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  out = out.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label, href) => {
    const safeHref = escapeAttr(href)
    const external = /^https?:\/\//i.test(href)
    const extra = external ? ' target="_blank" rel="noopener noreferrer"' : ''
    return `<a href="${safeHref}"${extra}>${label}</a>`
  })
  return out
}

function renderTable(lines) {
  const rows = lines
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^\||\|$/g, '').split('|').map((c) => c.trim()))

  if (rows.length < 2) return null
  const header = rows[0]
  const body = rows.slice(2)
  if (!body.length) return null

  const thead = `<thead><tr>${header.map((c) => `<th>${inlineMarkdown(c)}</th>`).join('')}</tr></thead>`
  const tbody = `<tbody>${body.map((r) => `<tr>${r.map((c) => `<td>${inlineMarkdown(c)}</td>`).join('')}</tr>`).join('')}</tbody>`
  return `<table>${thead}${tbody}</table>`
}

export function renderMarkdown(content) {
  const text = String(content || '').replace(/\r\n/g, '\n')
  if (!text.trim()) return ''

  const lines = text.split('\n')
  const html = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (!line.trim()) {
      i += 1
      continue
    }

    // Fenced code block
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim()
      i += 1
      const buf = []
      while (i < lines.length && !lines[i].startsWith('```')) {
        buf.push(lines[i])
        i += 1
      }
      if (i < lines.length) i += 1
      const cls = lang ? ` class="language-${escapeAttr(lang)}"` : ''
      html.push(`<pre><code${cls}>${escapeHtml(buf.join('\n'))}</code></pre>`)
      continue
    }

    // Headings
    const h = line.match(/^(#{1,6})\s+(.+)$/)
    if (h) {
      const level = h[1].length
      const raw = h[2].trim()
      const id = raw.toLowerCase().replace(/[^\w\u4e00-\u9fff\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '') || 'section'
      html.push(`<h${level} id="${id}" class="heading-with-anchor"><a class="heading-anchor" href="#${id}" aria-label="Link to this section">#</a>${inlineMarkdown(raw)}</h${level}>`)
      i += 1
      continue
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      html.push('<hr />')
      i += 1
      continue
    }

    // Blockquote
    if (line.trim().startsWith('>')) {
      const buf = []
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        buf.push(lines[i].replace(/^\s*>\s?/, ''))
        i += 1
      }
      html.push(`<blockquote><p>${inlineMarkdown(buf.join(' '))}</p></blockquote>`)
      continue
    }

    // Table
    if (line.includes('|') && i + 1 < lines.length && /^\s*\|?[\s:-]+\|[\s|:-]*$/.test(lines[i + 1])) {
      const buf = [line, lines[i + 1]]
      i += 2
      while (i < lines.length && lines[i].includes('|') && lines[i].trim()) {
        buf.push(lines[i])
        i += 1
      }
      const table = renderTable(buf)
      if (table) {
        html.push(table)
        continue
      }
    }

    // Lists (supports task list syntax)
    const ul = line.match(/^\s*[-*+]\s+(.+)$/)
    const ol = line.match(/^\s*\d+\.\s+(.+)$/)
    if (ul || ol) {
      const ordered = !!ol
      const tag = ordered ? 'ol' : 'ul'
      const items = []
      while (i < lines.length) {
        const cur = lines[i]
        const m = ordered ? cur.match(/^\s*\d+\.\s+(.+)$/) : cur.match(/^\s*[-*+]\s+(.+)$/)
        if (!m) break
        const itemText = m[1]
        const task = itemText.match(/^\[( |x|X)\]\s+(.+)$/)
        if (task) {
          const checked = task[1].toLowerCase() === 'x' ? ' checked' : ''
          items.push(`<li class="task-list-item"><input type="checkbox" disabled${checked} /> ${inlineMarkdown(task[2])}</li>`)
        } else {
          items.push(`<li>${inlineMarkdown(itemText)}</li>`)
        }
        i += 1
      }
      html.push(`<${tag}>${items.join('')}</${tag}>`)
      continue
    }

    // Paragraph
    const buf = [line]
    i += 1
    while (i < lines.length && lines[i].trim() && !/^(#{1,6}\s+|```|>\s*|[-*+]\s+|\d+\.\s+|(-{3,}|\*{3,}|_{3,})\s*$)/.test(lines[i])) {
      buf.push(lines[i])
      i += 1
    }
    html.push(`<p>${inlineMarkdown(buf.join(' '))}</p>`)
  }

  return html.join('\n')
}
