import { d as createAstro, c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead, b as addAttribute, u as unescapeHTML } from '../../chunks/astro/server_Cwf6Nwx_.mjs';
import 'kleur/colors';
import { $ as $$SiteLayout } from '../../chunks/SiteLayout_nEV2w1J0.mjs';
import { g as getArticle, s as splitComma, f as formatDate } from '../../chunks/api_C3kJ7QHg.mjs';
import { r as renderMarkdown, e as extractToc } from '../../chunks/markdown_DdU5uE_-.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro("https://chblog-2on.pages.dev");
const $$slug = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$slug;
  const { slug } = Astro2.params;
  let article;
  try {
    article = await getArticle(slug);
  } catch {
    return Astro2.redirect("/404");
  }
  if (!article || article.status !== "published" || article.type !== "blog") {
    return Astro2.redirect("/404");
  }
  const html = renderMarkdown(article.content);
  const toc = extractToc(article.content);
  const tags = splitComma(article.tags);
  const categories = splitComma(article.categories);
  return renderTemplate`${renderComponent($$result, "SiteLayout", $$SiteLayout, { "title": article.title, "description": article.excerpt || void 0, "ogImage": article.cover_image || void 0, "type": "article" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-6xl mx-auto px-4 sm:px-6 py-12"> <div class="flex gap-12"> <!-- Main Content --> <article class="flex-1 min-w-0"> <!-- Breadcrumb --> <nav class="flex items-center gap-2 text-sm text-slate-500 mb-8"> <a href="/" class="hover:text-slate-300 transition-colors">首页</a> <span>/</span> <a href="/blog" class="hover:text-slate-300 transition-colors">Blog</a> <span>/</span> <span class="text-slate-400 truncate">${article.title}</span> </nav> <!-- Cover Image --> ${article.cover_image && renderTemplate`<div class="aspect-video rounded-2xl overflow-hidden mb-10 border border-surface-700"> <img${addAttribute(article.cover_image, "src")}${addAttribute(article.title, "alt")} class="w-full h-full object-cover"> </div>`} <!-- Article Header --> <header class="mb-10"> <div class="flex flex-wrap items-center gap-2 mb-4"> <span class="badge-blog">📝 Blog</span> ${categories.map((cat) => renderTemplate`<span class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-700 text-slate-300 border border-surface-600">${cat}</span>`)} </div> <h1 class="text-3xl sm:text-4xl font-display font-bold text-white leading-tight mb-5"> ${article.title} </h1> <div class="flex flex-wrap items-center gap-5 text-sm text-slate-400"> <time class="flex items-center gap-1.5"> <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path> </svg>
发布于 ${formatDate(article.created_at)} </time> ${article.updated_at !== article.created_at && renderTemplate`<span class="flex items-center gap-1.5"> <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path> </svg>
更新于 ${formatDate(article.updated_at)} </span>`} <span class="flex items-center gap-1.5"> <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path> </svg> ${article.view_count} 次阅读
</span> </div> </header> <!-- Article Content --> <div class="prose-custom">${unescapeHTML(html)}</div> <!-- Tags --> ${tags.length > 0 && renderTemplate`<div class="mt-10 pt-8 border-t border-surface-700"> <div class="flex flex-wrap gap-2"> ${tags.map((tag) => renderTemplate`<a${addAttribute(`/blog?tag=${tag}`, "href")} class="tag">
#${tag} </a>`)} </div> </div>`} <!-- Article Navigation --> <div class="mt-10 pt-8 border-t border-surface-700 flex items-center justify-between"> <a href="/blog" class="btn-secondary"> <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path> </svg>
返回 Blog
</a> <a${addAttribute(`/admin?edit=${article.slug}`, "href")} class="btn-ghost text-xs"> <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path> </svg>
编辑此文
</a> </div> </article> <!-- Table of Contents (Sidebar) --> ${toc.length > 0 && renderTemplate`<aside class="hidden xl:block w-56 flex-shrink-0"> <div class="sticky top-24"> <h4 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">目录</h4> <nav class="space-y-1" id="toc"> ${toc.map((item) => renderTemplate`<a${addAttribute(`#${item.id}`, "href")}${addAttribute(`block text-sm text-slate-400 hover:text-accent-cyan transition-colors leading-5 toc-item ${item.level === 1 ? "font-medium" : item.level === 2 ? "pl-3" : "pl-6"}`, "class")}${addAttribute(item.id, "data-id")}> ${item.text} </a>`)} </nav> </div> </aside>`} </div> </div> ` })} <!-- ToC Active State Script --> `;
}, "/Users/alex/Downloads/techblog/frontend/src/pages/blog/[slug].astro", void 0);

const $$file = "/Users/alex/Downloads/techblog/frontend/src/pages/blog/[slug].astro";
const $$url = "/blog/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$slug,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
