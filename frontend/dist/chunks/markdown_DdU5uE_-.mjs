import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';

marked.use(
  markedHighlight({
    langPrefix: "hljs language-",
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : "plaintext";
      return hljs.highlight(code, { language }).value;
    }
  })
);
const renderer = new marked.Renderer();
renderer.link = ({ href, title, text }) => {
  const isExternal = href && (href.startsWith("http://") || href.startsWith("https://"));
  const target = isExternal ? ' target="_blank" rel="noopener noreferrer"' : "";
  const titleAttr = title ? ` title="${title}"` : "";
  return `<a href="${href}"${titleAttr}${target}>${text}</a>`;
};
renderer.image = ({ href, title, text }) => {
  const titleAttr = title ? ` title="${title}"` : "";
  return `<img src="${href}" alt="${text}"${titleAttr} loading="lazy" class="rounded-lg max-w-full" />`;
};
renderer.heading = ({ text, depth }) => {
  const id = text.toLowerCase().replace(/[^\w\u4e00-\u9fff\-]/g, "-").replace(/-+/g, "-");
  return `<h${depth} id="${id}">${text}</h${depth}>`;
};
marked.use({ renderer });
marked.setOptions({
  gfm: true,
  // GitHub Flavored Markdown
  breaks: false
});
function renderMarkdown(content) {
  try {
    return marked(content);
  } catch (e) {
    console.error("Markdown render error:", e);
    return `<p>${content}</p>`;
  }
}
function extractToc(content) {
  const headings = [];
  const regex = /^(#{1,3})\s+(.+)$/gm;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].replace(/[*_`]/g, "").trim();
    const id = text.toLowerCase().replace(/[^\w\u4e00-\u9fff\-]/g, "-").replace(/-+/g, "-");
    headings.push({ id, text, level });
  }
  return headings;
}

export { extractToc as e, renderMarkdown as r };
