import { d as createAstro, c as createComponent, m as maybeRenderHead, b as addAttribute, a as renderTemplate, r as renderComponent, F as Fragment } from '../chunks/astro/server_Cwf6Nwx_.mjs';
import 'kleur/colors';
import { $ as $$SiteLayout } from '../chunks/SiteLayout_nEV2w1J0.mjs';
import { $ as $$ArticleCard } from '../chunks/ArticleCard_Bc1YytQa.mjs';
import 'clsx';
import { a as getArticles, b as getCategories, c as getTags } from '../chunks/api_C3kJ7QHg.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro$1 = createAstro("https://chblog-2on.pages.dev");
const $$Pagination = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Pagination;
  const { page, total, limit, baseUrl } = Astro2.props;
  const totalPages = Math.ceil(total / limit);
  function getPageUrl(p) {
    const url = new URL(baseUrl, "http://x");
    url.searchParams.set("page", String(p));
    return url.pathname + url.search;
  }
  const pageItems = [];
  const filtered = Array.from({ length: totalPages }, (_, i) => i + 1).filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1);
  for (let i = 0; i < filtered.length; i++) {
    if (i > 0 && filtered[i] !== filtered[i - 1] + 1) {
      pageItems.push("ellipsis");
    }
    pageItems.push(filtered[i]);
  }
  return renderTemplate`${totalPages > 1 && renderTemplate`${maybeRenderHead()}<div class="flex items-center justify-center gap-2 mt-12"><!-- Prev -->${page > 1 ? renderTemplate`<a${addAttribute(getPageUrl(page - 1), "href")} class="btn-secondary px-4 py-2"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
上一页
</a>` : renderTemplate`<button class="btn-secondary px-4 py-2 opacity-40 cursor-not-allowed" disabled><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
上一页
</button>`}<!-- Page Numbers --><div class="flex items-center gap-1">${pageItems.map(
    (item) => item === "ellipsis" ? renderTemplate`<span class="px-2 text-slate-500">…</span>` : renderTemplate`<a${addAttribute(getPageUrl(item), "href")}${addAttribute(`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${item === page ? "bg-accent-cyan text-slate-900 font-semibold" : "text-slate-400 hover:text-slate-200 hover:bg-surface-700"}`, "class")}>${item}</a>`
  )}</div><!-- Next -->${page < totalPages ? renderTemplate`<a${addAttribute(getPageUrl(page + 1), "href")} class="btn-secondary px-4 py-2">
下一页
<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></a>` : renderTemplate`<button class="btn-secondary px-4 py-2 opacity-40 cursor-not-allowed" disabled>
下一页
<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></button>`}</div>`}`;
}, "/Users/alex/Downloads/techblog/frontend/src/components/Pagination.astro", void 0);

const $$Astro = createAstro("https://chblog-2on.pages.dev");
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const { searchParams, pathname } = Astro2.url;
  const page = parseInt(searchParams.get("page") || "1");
  const category = searchParams.get("category") || void 0;
  const tag = searchParams.get("tag") || void 0;
  const limit = 9;
  const [articlesResult, categories, tags] = await Promise.all([
    getArticles({ type: "blog", page, limit, category, tag }),
    getCategories(),
    getTags()
  ]);
  return renderTemplate`${renderComponent($$result, "SiteLayout", $$SiteLayout, { "title": "Blog" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-6xl mx-auto px-4 sm:px-6 py-12"> <!-- Page Header --> <div class="mb-10"> <div class="flex items-center gap-3 mb-2"> <h1 class="text-3xl font-display font-bold text-white">Blog</h1> <span class="badge-blog">文章</span> </div> <p class="text-slate-400">分享 AI 与科技的原创思考与技术心得</p> </div> <div class="flex flex-col lg:flex-row gap-10"> <!-- Sidebar --> <aside class="lg:w-56 flex-shrink-0"> <!-- Filter by Category --> <div class="mb-6"> <h3 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">分类</h3> <div class="space-y-1"> <a href="/blog"${addAttribute(`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${!category ? "bg-surface-700 text-white" : "text-slate-400 hover:text-slate-200 hover:bg-surface-700/50"}`, "class")}> <span>全部</span> <span class="text-slate-600 text-xs">${articlesResult.total}</span> </a> ${categories.map((cat) => renderTemplate`<a${addAttribute(`/blog?category=${cat.slug}`, "href")}${addAttribute(`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${category === cat.slug ? "bg-surface-700 text-white" : "text-slate-400 hover:text-slate-200 hover:bg-surface-700/50"}`, "class")}> <span class="flex items-center gap-2"> <span class="w-1.5 h-1.5 rounded-full"${addAttribute(`background-color: ${cat.color}`, "style")}></span> ${cat.name} </span> <span class="text-slate-600 text-xs">${cat.count}</span> </a>`)} </div> </div> <!-- Tags --> <div> <h3 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">标签</h3> <div class="flex flex-wrap gap-1.5"> ${tags.slice(0, 15).map((t) => renderTemplate`<a${addAttribute(`/blog?tag=${t.slug}`, "href")}${addAttribute(`tag text-xs ${tag === t.slug ? "tag-active" : ""}`, "class")}>
#${t.name} </a>`)} </div> </div> </aside> <!-- Article Grid --> <div class="flex-1 min-w-0">  ${(category || tag) && renderTemplate`<div class="flex items-center gap-2 mb-6 text-sm"> <span class="text-slate-400">筛选：</span> ${category && renderTemplate`<span class="px-2.5 py-1 rounded-full bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20">${categories.find((c) => c.slug === category)?.name || category}</span>`} ${tag && renderTemplate`<span class="px-2.5 py-1 rounded-full bg-accent-purple/10 text-accent-purple border border-accent-purple/20">#${tags.find((t) => t.slug === tag)?.name || tag}</span>`} <a href="/blog" class="text-slate-500 hover:text-slate-300 flex items-center gap-1"> <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path> </svg>
清除
</a> </div>`} ${articlesResult.results.length > 0 ? renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <div class="grid sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-8"> ${articlesResult.results.map((article, i) => renderTemplate`${renderComponent($$result3, "ArticleCard", $$ArticleCard, { "article": article, "class": `stagger-${Math.min(i + 1, 5)}` })}`)} </div> ${renderComponent($$result3, "Pagination", $$Pagination, { "page": page, "total": articlesResult.total, "limit": limit, "baseUrl": pathname + "?" + searchParams.toString() })} ` })}` : renderTemplate`<div class="text-center py-20 text-slate-500"> <div class="text-5xl mb-4">🔍</div> <p class="text-lg font-medium text-slate-400 mb-2">暂无文章</p> <p class="text-sm">尝试选择其他分类或标签</p> </div>`} </div> </div> </div> ` })}`;
}, "/Users/alex/Downloads/techblog/frontend/src/pages/blog/index.astro", void 0);

const $$file = "/Users/alex/Downloads/techblog/frontend/src/pages/blog/index.astro";
const $$url = "/blog";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
