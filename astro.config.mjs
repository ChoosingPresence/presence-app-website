// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://presence.app',
  integrations: [sitemap()],

  build: {
    // Keep all CSS in external files so the Content-Security-Policy
    // (style-src 'self' in public/_headers) can stay strict.
    inlineStylesheets: 'never',
  },

  adapter: cloudflare(),
});