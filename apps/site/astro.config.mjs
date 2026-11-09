// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import cspHeaders from './integrations/csp-headers.mjs';

export default defineConfig({
  site: 'https://www.anirudh.dev',
  output: 'static',
  integrations: [sitemap(), cspHeaders()],
  prefetch: false,
  build: { inlineStylesheets: 'auto' },
  vite: {
    // Keep scripts as external files so the CSP can stay at script-src 'self'.
    build: { assetsInlineLimit: 0 },
  },
});
