import { d as createAstro, c as createComponent, m as maybeRenderHead, b as addAttribute, a as renderTemplate, r as renderComponent, e as renderSlot } from './astro/server_Cwf6Nwx_.mjs';
import 'kleur/colors';
import { $ as $$BaseLayout } from './BaseLayout_Dcc9Mx8q.mjs';
import 'clsx';

const $$Astro$1 = createAstro("https://chblog-2on.pages.dev");
const $$Navbar = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Navbar;
  const currentPath = Astro2.url.pathname;
  const siteName = "AI & 科技笔记（本地预览）";
  const navLinks = [
    { href: "/", label: "首页" },
    { href: "/blog", label: "Blog" },
    { href: "/wiki", label: "Wiki" },
    { href: "/search", label: "搜索" }
  ];
  function isActive(href) {
    if (href === "/") return currentPath === "/";
    return currentPath.startsWith(href);
  }
  return renderTemplate`${maybeRenderHead()}<header class="sticky top-0 z-50 border-b border-surface-600/50 backdrop-blur-xl bg-surface-900/80"> <nav class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between"> <!-- Logo --> <a href="/" class="flex items-center gap-2.5 group"> <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center text-lg shadow-lg group-hover:scale-110 transition-transform">
🤖
</div> <span class="font-display font-semibold text-white text-base hidden sm:block">${siteName}</span> </a> <!-- Nav Links --> <div class="flex items-center gap-1"> ${navLinks.map((link) => renderTemplate`<a${addAttribute(link.href, "href")}${addAttribute(`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${isActive(link.href) ? "text-white bg-surface-700" : "text-slate-400 hover:text-slate-200 hover:bg-surface-700/50"}`, "class")}> ${link.label} </a>`)} </div> <!-- Right Actions --> <div class="flex items-center gap-2"> <!-- Search shortcut --> <a href="/search" class="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-700 border border-surface-600 text-slate-400 text-xs hover:border-accent-cyan/30 transition-colors"> <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path> </svg> <span>搜索</span> <kbd class="px-1.5 py-0.5 bg-surface-600 rounded text-xs font-mono">⌘K</kbd> </a> <!-- Admin link --> <a href="/admin" class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-200 hover:bg-surface-700 transition-colors" title="管理后台"> <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path> </svg> </a> </div> </nav> </header> <!-- Keyboard shortcut for search --> `;
}, "/Users/alex/Downloads/techblog/frontend/src/components/Navbar.astro", void 0);

const $$Footer = createComponent(($$result, $$props, $$slots) => {
  const author = "Your Name";
  const github = "https://github.com/yourusername";
  const twitter = "https://twitter.com/yourusername";
  const siteName = "AI & 科技笔记（本地预览）";
  return renderTemplate`${maybeRenderHead()}<footer class="border-t border-surface-600/50 mt-20"> <div class="max-w-6xl mx-auto px-4 sm:px-6 py-10"> <div class="flex flex-col sm:flex-row items-center justify-between gap-4"> <div class="flex items-center gap-2 text-slate-500 text-sm"> <span>© ${(/* @__PURE__ */ new Date()).getFullYear()}</span> <span class="text-accent-cyan font-medium">${author}</span> <span>·</span> <span>${siteName}</span> <span>·</span> <span>Powered by Cloudflare</span> </div> <div class="flex items-center gap-4"> <a${addAttribute(github, "href")} target="_blank" rel="noopener" class="text-slate-500 hover:text-slate-300 transition-colors" aria-label="GitHub"> <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"> <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"></path> </svg> </a> <a${addAttribute(twitter, "href")} target="_blank" rel="noopener" class="text-slate-500 hover:text-slate-300 transition-colors" aria-label="Twitter"> <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"> <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path> </svg> </a> <a href="/rss.xml" class="text-slate-500 hover:text-orange-400 transition-colors" aria-label="RSS"> <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"> <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19.01 7.38 20 6.18 20C4.98 20 4 19.01 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1z"></path> </svg> </a> </div> </div> </div> </footer>`;
}, "/Users/alex/Downloads/techblog/frontend/src/components/Footer.astro", void 0);

const $$Astro = createAstro("https://chblog-2on.pages.dev");
const $$SiteLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$SiteLayout;
  const props = Astro2.props;
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { ...props }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-screen flex flex-col"> ${renderComponent($$result2, "Navbar", $$Navbar, {})} <main class="flex-1"> ${renderSlot($$result2, $$slots["default"])} </main> ${renderComponent($$result2, "Footer", $$Footer, {})} </div> ` })}`;
}, "/Users/alex/Downloads/techblog/frontend/src/layouts/SiteLayout.astro", void 0);

export { $$SiteLayout as $ };
