import { d as createAstro, c as createComponent, m as maybeRenderHead, b as addAttribute, a as renderTemplate } from './astro/server_Cwf6Nwx_.mjs';
import 'kleur/colors';
import 'clsx';
import { s as splitComma, f as formatDate } from './api_C3kJ7QHg.mjs';

const $$Astro = createAstro("https://chblog-2on.pages.dev");
const $$ArticleCard = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$ArticleCard;
  const { article, class: className = "" } = Astro2.props;
  const tags = splitComma(article.tags);
  const basePath = article.type === "blog" ? "/blog" : "/wiki";
  return renderTemplate`${maybeRenderHead()}<article${addAttribute(`card-glow group animate-in ${className}`, "class")}> ${article.cover_image && renderTemplate`<div class="aspect-video overflow-hidden"> <img${addAttribute(article.cover_image, "src")}${addAttribute(article.title, "alt")} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy"> </div>`} <div class="p-6"> <!-- Type Badge --> <div class="flex items-center gap-2 mb-3"> <span${addAttribute(article.type === "blog" ? "badge-blog" : "badge-wiki", "class")}> ${article.type === "blog" ? "\u{1F4DD} Blog" : "\u{1F4DA} Wiki"} </span> <time class="text-slate-500 text-xs">${formatDate(article.created_at)}</time> </div> <!-- Title --> <h2 class="text-lg font-display font-semibold text-white mb-2 leading-snug group-hover:text-accent-cyan transition-colors line-clamp-2"> <a${addAttribute(`${basePath}/${article.slug}`, "href")} class="hover:no-underline"> ${article.title} </a> </h2> <!-- Excerpt --> ${article.excerpt && renderTemplate`<p class="text-slate-400 text-sm leading-6 mb-4 line-clamp-2"> ${article.excerpt} </p>`} <!-- Tags --> ${tags.length > 0 && renderTemplate`<div class="flex flex-wrap gap-1.5"> ${tags.slice(0, 3).map((tag) => renderTemplate`<span class="px-2 py-0.5 rounded-md bg-surface-700 text-slate-400 text-xs border border-surface-600">
#${tag} </span>`)} ${tags.length > 3 && renderTemplate`<span class="text-slate-500 text-xs self-center">+${tags.length - 3}</span>`} </div>`} <!-- Footer --> <div class="flex items-center justify-between mt-4 pt-4 border-t border-surface-700"> <a${addAttribute(`${basePath}/${article.slug}`, "href")} class="text-accent-cyan text-sm font-medium hover:text-cyan-300 transition-colors flex items-center gap-1 group/link">
阅读全文
<svg class="w-4 h-4 group-hover/link:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path> </svg> </a> <span class="text-slate-600 text-xs flex items-center gap-1"> <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path> </svg> ${article.view_count} </span> </div> </div> </article>`;
}, "/Users/alex/Downloads/techblog/frontend/src/components/ArticleCard.astro", void 0);

export { $$ArticleCard as $ };
