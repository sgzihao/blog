import { d as createAstro, c as createComponent, b as addAttribute, a as renderTemplate, f as renderHead, e as renderSlot } from './astro/server_Cwf6Nwx_.mjs';
import 'kleur/colors';
import 'clsx';
/* empty css                          */

const $$Astro = createAstro("https://chblog-2on.pages.dev");
const $$BaseLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$BaseLayout;
  const {
    title,
    description = "记录AI与科技的思考与探索",
    ogImage,
    type = "website"
  } = Astro2.props;
  const siteName = "AI & 科技笔记（本地预览）";
  const fullTitle = title ? `${title} — ${siteName}` : siteName;
  const canonicalUrl = new URL(Astro2.url.pathname, Astro2.site);
  return renderTemplate`<html lang="zh-CN"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="canonical"${addAttribute(canonicalUrl, "href")}><!-- SEO --><title>${fullTitle}</title><meta name="description"${addAttribute(description, "content")}><!-- Open Graph --><meta property="og:type"${addAttribute(type, "content")}><meta property="og:title"${addAttribute(fullTitle, "content")}><meta property="og:description"${addAttribute(description, "content")}><meta property="og:site_name"${addAttribute(siteName, "content")}>${ogImage && renderTemplate`<meta property="og:image"${addAttribute(ogImage, "content")}>`}<!-- Twitter Card --><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title"${addAttribute(fullTitle, "content")}><meta name="twitter:description"${addAttribute(description, "content")}><!-- Favicon (emoji) --><link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🤖</text></svg>"><!-- Preconnect fonts --><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>${renderHead()}</head> <body> ${renderSlot($$result, $$slots["default"])} </body></html>`;
}, "/Users/alex/Downloads/techblog/frontend/src/layouts/BaseLayout.astro", void 0);

export { $$BaseLayout as $ };
