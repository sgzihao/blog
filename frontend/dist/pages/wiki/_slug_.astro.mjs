import { d as createAstro, c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead, u as unescapeHTML, b as addAttribute } from '../../chunks/astro/server_Cwf6Nwx_.mjs';
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
  if (!article || article.status !== "published" || article.type !== "wiki") {
    return Astro2.redirect("/404");
  }
  const html = renderMarkdown(article.content);
  const toc = extractToc(article.content);
  const tags = splitComma(article.tags);
  return renderTemplate`${renderComponent($$result, "SiteLayout", $$SiteLayout, { "title": article.title, "description": article.excerpt || void 0, "type": "article" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-6xl mx-auto px-4 sm:px-6 py-12"> <div class="flex gap-12"> <!-- Main --> <article class="flex-1 min-w-0"> <nav class="flex items-center gap-2 text-sm text-slate-500 mb-8"> <a href="/" class="hover:text-slate-300 transition-colors">首页</a> <span>/</span> <a href="/wiki" class="hover:text-slate-300 transition-colors">Wiki</a> <span>/</span> <span class="text-slate-400 truncate">${article.title}</span> </nav> <header class="mb-10"> <div class="flex items-center gap-2 mb-4"> <span class="badge-wiki">📚 Wiki</span> </div> <h1 class="text-3xl sm:text-4xl font-display font-bold text-white leading-tight mb-5"> ${article.title} </h1> <div class="flex flex-wrap items-center gap-5 text-sm text-slate-400"> <time>最后更新：${formatDate(article.updated_at)}</time> <span class="flex items-center gap-1.5"> <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path> </svg> ${article.view_count} 次查看
</span> </div> </header> <div class="prose-custom">${unescapeHTML(html)}</div> ${tags.length > 0 && renderTemplate`<div class="mt-10 pt-8 border-t border-surface-700"> <div class="flex flex-wrap gap-2"> ${tags.map((tag) => renderTemplate`<a${addAttribute(`/wiki?tag=${tag}`, "href")} class="tag">#${tag}</a>`)} </div> </div>`} <div class="mt-10 pt-8 border-t border-surface-700 flex items-center justify-between"> <a href="/wiki" class="btn-secondary"> <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path> </svg>
返回 Wiki
</a> <a${addAttribute(`/admin?edit=${article.slug}`, "href")} class="btn-ghost text-xs"> <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path> </svg>
编辑
</a> </div> </article> <!-- TOC --> ${toc.length > 0 && renderTemplate`<aside class="hidden xl:block w-56 flex-shrink-0"> <div class="sticky top-24"> <h4 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">目录</h4> <nav class="space-y-1"> ${toc.map((item) => renderTemplate`<a${addAttribute(`#${item.id}`, "href")}${addAttribute(`block text-sm text-slate-400 hover:text-accent-purple transition-colors leading-5 ${item.level === 1 ? "font-medium" : item.level === 2 ? "pl-3" : "pl-6"}`, "class")}> ${item.text} </a>`)} </nav> </div> </aside>`} </div> </div> ` })}`;
}, "/Users/alex/Downloads/techblog/frontend/src/pages/wiki/[slug].astro", void 0);

const $$file = "/Users/alex/Downloads/techblog/frontend/src/pages/wiki/[slug].astro";
const $$url = "/wiki/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$slug,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
