import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_Cwf6Nwx_.mjs';
import 'kleur/colors';
import { $ as $$SiteLayout } from '../chunks/SiteLayout_nEV2w1J0.mjs';
export { renderers } from '../renderers.mjs';

const $$404 = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "SiteLayout", $$SiteLayout, { "title": "\u9875\u9762\u672A\u627E\u5230" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-lg mx-auto px-4 sm:px-6 py-32 text-center"> <div class="text-8xl mb-6 opacity-80">🤖</div> <h1 class="text-6xl font-display font-bold text-white mb-4">404</h1> <p class="text-slate-400 text-lg mb-2">哎，这个页面不存在</p> <p class="text-slate-500 text-sm mb-8">可能已被删除，或者 URL 输入有误</p> <div class="flex items-center justify-center gap-3"> <a href="/" class="btn-primary">返回首页</a> <a href="/search" class="btn-secondary">搜索内容</a> </div> </div> ` })}`;
}, "/Users/alex/Downloads/techblog/frontend/src/pages/404.astro", void 0);

const $$file = "/Users/alex/Downloads/techblog/frontend/src/pages/404.astro";
const $$url = "/404";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$404,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
