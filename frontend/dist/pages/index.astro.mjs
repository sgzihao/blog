import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead, b as addAttribute } from '../chunks/astro/server_Cwf6Nwx_.mjs';
import 'kleur/colors';
import { $ as $$SiteLayout } from '../chunks/SiteLayout_nEV2w1J0.mjs';
import { $ as $$ArticleCard } from '../chunks/ArticleCard_Bc1YytQa.mjs';
import { a as getArticles, b as getCategories, c as getTags } from '../chunks/api_C3kJ7QHg.mjs';
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const [latestBlogs, latestWikis, categories, tags] = await Promise.all([
    getArticles({ type: "blog", limit: 6 }),
    getArticles({ type: "wiki", limit: 4 }),
    getCategories(),
    getTags()
  ]);
  return renderTemplate`${renderComponent($$result, "SiteLayout", $$SiteLayout, {}, { "default": async ($$result2) => renderTemplate`  ${maybeRenderHead()}<section class="relative max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-16"> <!-- Background glow --> <div class="absolute inset-0 overflow-hidden pointer-events-none"> <div class="absolute top-20 left-1/4 w-96 h-96 bg-accent-cyan/5 rounded-full blur-3xl"></div> <div class="absolute top-32 right-1/4 w-80 h-80 bg-accent-purple/5 rounded-full blur-3xl"></div> </div> <div class="relative text-center"> <!-- Avatar / Icon --> <div class="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-cyan/20 to-accent-purple/20 border border-accent-cyan/20 text-4xl mb-6 animate-in">
🤖
</div> <h1 class="text-4xl sm:text-5xl font-display font-bold text-white mb-4 animate-in stagger-1">
AI & 科技
<span class="text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan to-accent-purple"> 知识库</span> </h1> <p class="text-slate-400 text-lg max-w-xl mx-auto mb-8 leading-relaxed animate-in stagger-2">
记录对人工智能、大语言模型和前沿科技的思考与探索。<br>
分享技术心得，整理系统笔记。
</p> <div class="flex items-center justify-center gap-3 animate-in stagger-3"> <a href="/blog" class="btn-primary"> <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path> </svg>
读 Blog
</a> <a href="/wiki" class="btn-secondary"> <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path> </svg>
查 Wiki
</a> <a href="/search" class="btn-secondary"> <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path> </svg>
搜索
</a> </div> </div> <!-- Stats --> <div class="grid grid-cols-3 gap-4 max-w-lg mx-auto mt-14 animate-in stagger-4"> ${[
    { label: "Blog \u6587\u7AE0", value: latestBlogs.total, icon: "\u{1F4DD}" },
    { label: "Wiki \u7B14\u8BB0", value: latestWikis.total, icon: "\u{1F4DA}" },
    { label: "\u77E5\u8BC6\u6807\u7B7E", value: tags.length, icon: "\u{1F3F7}\uFE0F" }
  ].map((stat) => renderTemplate`<div class="text-center p-4 rounded-xl bg-surface-800 border border-surface-700"> <div class="text-2xl mb-1">${stat.icon}</div> <div class="text-2xl font-display font-bold text-white">${stat.value}</div> <div class="text-xs text-slate-500 mt-0.5">${stat.label}</div> </div>`)} </div> </section>  ${categories.length > 0 && renderTemplate`<section class="max-w-6xl mx-auto px-4 sm:px-6 mb-16"> <div class="flex items-center gap-3 mb-6"> <h2 class="text-lg font-display font-semibold text-white">分类浏览</h2> <div class="flex-1 h-px bg-surface-700"></div> </div> <div class="flex flex-wrap gap-2"> ${categories.map((cat) => renderTemplate`<a${addAttribute(`/blog?category=${cat.slug}`, "href")} class="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-800 border border-surface-700 hover:border-accent-cyan/30 text-slate-300 hover:text-accent-cyan text-sm transition-all group"> <span class="w-2 h-2 rounded-full"${addAttribute(`background-color: ${cat.color}`, "style")}></span> ${cat.name} <span class="text-slate-600 group-hover:text-slate-500 text-xs">${cat.count}</span> </a>`)} </div> </section>`} <section class="max-w-6xl mx-auto px-4 sm:px-6 mb-16"> <div class="flex items-center justify-between mb-6"> <div class="flex items-center gap-3"> <h2 class="text-lg font-display font-semibold text-white">最新 Blog</h2> <span class="badge-blog">Blog</span> </div> <a href="/blog" class="text-accent-cyan text-sm hover:text-cyan-300 transition-colors flex items-center gap-1">
查看全部
<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path> </svg> </a> </div> <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"> ${latestBlogs.results.map((article, i) => renderTemplate`${renderComponent($$result2, "ArticleCard", $$ArticleCard, { "article": article, "class": `stagger-${Math.min(i + 1, 5)}` })}`)} </div> ${latestBlogs.results.length === 0 && renderTemplate`<div class="text-center py-16 text-slate-500">
暂无文章，<a href="/admin" class="text-accent-cyan hover:text-cyan-300">去写一篇吧</a> </div>`} </section>  ${latestWikis.results.length > 0 && renderTemplate`<section class="max-w-6xl mx-auto px-4 sm:px-6 mb-16"> <div class="flex items-center justify-between mb-6"> <div class="flex items-center gap-3"> <h2 class="text-lg font-display font-semibold text-white">Wiki 笔记</h2> <span class="badge-wiki">Wiki</span> </div> <a href="/wiki" class="text-accent-cyan text-sm hover:text-cyan-300 transition-colors flex items-center gap-1">
查看全部
<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path> </svg> </a> </div> <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"> ${latestWikis.results.map((article, i) => renderTemplate`<article${addAttribute(`card-glow p-5 animate-in stagger-${i + 1}`, "class")}> <span class="badge-wiki text-xs mb-3 block w-fit">Wiki</span> <h3 class="font-semibold text-white text-sm mb-2 leading-snug"> <a${addAttribute(`/wiki/${article.slug}`, "href")} class="hover:text-accent-cyan transition-colors"> ${article.title} </a> </h3> ${article.excerpt && renderTemplate`<p class="text-slate-500 text-xs leading-5 line-clamp-2">${article.excerpt}</p>`} </article>`)} </div> </section>`} ${tags.length > 0 && renderTemplate`<section class="max-w-6xl mx-auto px-4 sm:px-6 mb-16"> <div class="flex items-center gap-3 mb-6"> <h2 class="text-lg font-display font-semibold text-white">热门标签</h2> <div class="flex-1 h-px bg-surface-700"></div> </div> <div class="flex flex-wrap gap-2"> ${tags.slice(0, 20).map((tag) => renderTemplate`<a${addAttribute(`/blog?tag=${tag.slug}`, "href")} class="tag">
#${tag.name} <span class="ml-1 text-slate-600 text-xs">${tag.count}</span> </a>`)} </div> </section>`}` })}`;
}, "/Users/alex/Downloads/techblog/frontend/src/pages/index.astro", void 0);

const $$file = "/Users/alex/Downloads/techblog/frontend/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
