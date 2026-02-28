import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import sitemap from '@astrojs/sitemap'

const enableSitemap = process.env.ENABLE_SITEMAP === 'true'

export default defineConfig({
  site: 'https://techblog-94z.pages.dev/', // 修改为你的实际域名
  output: 'static',
  integrations: [
    tailwind({ applyBaseStyles: false }),
    ...(enableSitemap ? [sitemap()] : []),
  ],
  build: {
    assets: '_assets',
  },
})
