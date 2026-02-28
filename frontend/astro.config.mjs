import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import sitemap from '@astrojs/sitemap'

const enableSitemap = process.env.ENABLE_SITEMAP === 'true'

export default defineConfig({
  site: 'https://techblog-94z.pages.dev/', // Update to your actual domain
  output: 'static',
  integrations: [
    tailwind({ applyBaseStyles: false }),
    ...(enableSitemap ? [sitemap()] : []),
  ],
  build: {
    assets: '_assets',
  },
})
