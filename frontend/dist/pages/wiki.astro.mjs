import { d as createAstro, c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead, b as addAttribute } from '../chunks/astro/server_Cwf6Nwx_.mjs';
import 'kleur/colors';
import { $ as $$SiteLayout } from '../chunks/SiteLayout_nEV2w1J0.mjs';
import { a as getArticles, b as getCategories, c as getTags } from '../chunks/api_C3kJ7QHg.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro("https://chblog-2on.pages.dev");
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const { searchParams } = Astro2.url;
  const tag = searchParams.get("tag") || void 0;
  const category = searchParams.get("category") || void 0;
  const [articlesResult, categories, tags] = await Promise.all([
    getArticles({ type: "wiki", limit: 50, tag, category }),
    getCategories(),
    getTags()
  ]);
  const articles = articlesResult.results;
  const grouped = {};
  for (const article of articles) {
    const cats = article.categories?.split(",") || ["\u672A\u5206\u7C7B"];
    const cat = cats[0]?.trim() || "\u672A\u5206\u7C7B";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(article);
  }
  return renderTemplate`${renderComponent($$result, "SiteLayout", $$SiteLayout, { "title": "Wiki" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-6xl mx-auto px-4 sm:px-6 py-12"> <!-- Header --> <div class="mb-10"> <div class="flex items-center gap-3 mb-2"> <h1 class="text-3xl font-display font-bold text-white">Wiki</h1> <span class="badge-wiki">知识库</span> </div> <p class="text-slate-400">系统整理的技术笔记，方便查阅和学习</p> </div> <!-- Search + Filters --> <div class="flex flex-wrap gap-2 mb-8"> <a href="/wiki"${addAttribute(`tag ${!tag && !category ? "tag-active" : ""}`, "class")}>全部</a> ${tags.filter((t) => t.count > 0).slice(0, 10).map((t) => renderTemplate`<a${addAttribute(`/wiki?tag=${t.slug}`, "href")}${addAttribute(`tag ${tag === t.slug ? "tag-active" : ""}`, "class")}>
#${t.name} </a>`)} </div> ${articles.length > 0 ? renderTemplate`<div class="space-y-10"> ${Object.entries(grouped).map(([catName, catArticles]) => renderTemplate`<section> <div class="flex items-center gap-3 mb-4"> <h2 class="text-base font-semibold text-white">${catName}</h2> <div class="flex-1 h-px bg-surface-700"></div> <span class="text-slate-600 text-xs">${catArticles.length}</span> </div> <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3"> ${catArticles.map((article) => renderTemplate`<a${addAttribute(`/wiki/${article.slug}`, "href")} class="card group p-4 flex items-start gap-3 hover:border-accent-purple/30 transition-all"> <div class="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-500/20 transition-colors"> <svg class="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path> </svg> </div> <div class="flex-1 min-w-0"> <h3 class="font-medium text-slate-200 text-sm leading-5 group-hover:text-white transition-colors line-clamp-1 mb-1"> ${article.title} </h3> ${article.excerpt && renderTemplate`<p class="text-slate-500 text-xs line-clamp-2 leading-4">${article.excerpt}</p>`} </div> </a>`)} </div> </section>`)} </div>` : renderTemplate`<div class="text-center py-20 text-slate-500"> <div class="text-5xl mb-4">📚</div> <p class="text-lg font-medium text-slate-400 mb-2">暂无 Wiki 笔记</p> <a href="/admin" class="text-accent-cyan hover:text-cyan-300">去添加第一篇</a> </div>`} </div> ` })}`;
}, "/Users/alex/Downloads/techblog/frontend/src/pages/wiki/index.astro", void 0);

const $$file = "/Users/alex/Downloads/techblog/frontend/src/pages/wiki/index.astro";
const $$url = "/wiki";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
