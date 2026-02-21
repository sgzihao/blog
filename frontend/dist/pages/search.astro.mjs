import { d as createAstro, c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead, b as addAttribute, u as unescapeHTML } from '../chunks/astro/server_Cwf6Nwx_.mjs';
import 'kleur/colors';
import { $ as $$SiteLayout } from '../chunks/SiteLayout_nEV2w1J0.mjs';
import { d as searchArticles, f as formatDate } from '../chunks/api_C3kJ7QHg.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro("https://chblog-2on.pages.dev");
const $$Search = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Search;
  const { searchParams } = Astro2.url;
  const q = searchParams.get("q") || "";
  const type = searchParams.get("type") || "";
  let results = [];
  let searchTime = 0;
  if (q) {
    const start = Date.now();
    const data = await searchArticles(q, type || void 0);
    results = data.results;
    searchTime = Date.now() - start;
  }
  return renderTemplate`${renderComponent($$result, "SiteLayout", $$SiteLayout, { "title": q ? `\u641C\u7D22"${q}"` : "\u641C\u7D22" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-3xl mx-auto px-4 sm:px-6 py-12"> <!-- Header --> <div class="mb-8"> <h1 class="text-2xl font-display font-bold text-white mb-6">搜索</h1> <!-- Search Form --> <form method="get" class="flex gap-2"> <div class="flex-1 relative"> <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path> </svg> <input type="text" name="q"${addAttribute(q, "value")} placeholder="搜索文章、Wiki..." class="input pl-11 text-base h-12" autofocus> </div> <select name="type" class="select w-28 h-12"> <option value=""${addAttribute(!type, "selected")}>全部</option> <option value="blog"${addAttribute(type === "blog", "selected")}>Blog</option> <option value="wiki"${addAttribute(type === "wiki", "selected")}>Wiki</option> </select> <button type="submit" class="btn-primary h-12 px-6">搜索</button> </form> </div> <!-- Results --> ${q && renderTemplate`<div> <div class="flex items-center gap-2 text-sm text-slate-500 mb-6"> <span>找到 <strong class="text-slate-300">${results.length}</strong> 个结果</span> ${searchTime > 0 && renderTemplate`<span>· 耗时 ${searchTime}ms</span>`} ${q && renderTemplate`<span class="text-accent-cyan">"${q}"</span>`} </div> ${results.length > 0 ? renderTemplate`<div class="space-y-4"> ${results.map((result) => {
    const basePath = result.type === "blog" ? "/blog" : "/wiki";
    return renderTemplate`<article class="card p-5 hover:border-surface-500 transition-all group"> <div class="flex items-start gap-4"> <div${addAttribute(`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${result.type === "blog" ? "bg-cyan-500/10" : "bg-purple-500/10"}`, "class")}> ${result.type === "blog" ? renderTemplate`<svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path> </svg>` : renderTemplate`<svg class="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path> </svg>`} </div> <div class="flex-1 min-w-0"> <div class="flex items-center gap-2 mb-1"> <span${addAttribute(result.type === "blog" ? "badge-blog" : "badge-wiki", "class")}> ${result.type === "blog" ? "Blog" : "Wiki"} </span> <time class="text-slate-500 text-xs">${formatDate(result.created_at)}</time> </div> <h2 class="font-semibold text-white group-hover:text-accent-cyan transition-colors mb-2"> <a${addAttribute(`${basePath}/${result.slug}`, "href")}>${result.title}</a> </h2> ${result.highlight ? renderTemplate`<p class="text-slate-400 text-sm leading-6 search-highlight">${unescapeHTML(result.highlight)}</p>` : result.excerpt ? renderTemplate`<p class="text-slate-400 text-sm leading-6">${result.excerpt}</p>` : null} </div> </div> </article>`;
  })} </div>` : renderTemplate`<div class="text-center py-16"> <div class="text-5xl mb-4">🔍</div> <p class="text-lg font-medium text-slate-300 mb-2">没有找到相关内容</p> <p class="text-slate-500 text-sm">试试其他关键词，或者搜索英文</p> </div>`} </div>`} ${!q && renderTemplate`<div class="text-center py-16"> <div class="text-5xl mb-4">✨</div> <p class="text-slate-400">输入关键词开始搜索</p> <p class="text-slate-600 text-sm mt-2">支持中文、标题、正文全文检索</p> <p class="text-slate-600 text-sm mt-1">快捷键：<kbd class="px-1.5 py-0.5 bg-surface-700 rounded text-xs font-mono">⌘K</kbd></p> </div>`} </div> ` })}`;
}, "/Users/alex/Downloads/techblog/frontend/src/pages/search.astro", void 0);

const $$file = "/Users/alex/Downloads/techblog/frontend/src/pages/search.astro";
const $$url = "/search";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Search,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
