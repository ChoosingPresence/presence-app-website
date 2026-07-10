// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://practicingpresence.app',
  integrations: [sitemap()],
  build: {
    // Keep all CSS in external files so the Content-Security-Policy
    // (style-src 'self' in public/_headers) can stay strict.
    inlineStylesheets: 'never',
  },
  vite: {
    build: {
      // Small <script> tags (e.g. the theme/menu toggle) would otherwise get
      // inlined into the HTML by Vite's default asset-inlining threshold,
      // which the CSP's script-src 'self' blocks. Force every script to be
      // emitted as an external, same-origin file instead.
      assetsInlineLimit: 0,
    },
  },
});
