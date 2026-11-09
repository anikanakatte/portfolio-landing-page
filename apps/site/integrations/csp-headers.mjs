// Writes dist/_headers with the Content-Security-Policy, so it can vary by Netlify deploy context.
// Deploy previews and branch deploys allow framing app.netlify.com for the Netlify Drawer
// (the feedback toolbar Netlify injects into previews). Production stays strict.
// netlify.toml must NOT also set a CSP: two CSP headers are both enforced.
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const BASE = {
  'default-src': ["'self'"],
  'script-src': ["'self'"],
  // 'unsafe-inline' because Astro inlines small stylesheets (build.inlineStylesheets: 'auto').
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:'],
  'font-src': ["'self'"],
  'connect-src': ["'self'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
};

const PREVIEW_EXTRAS = {
  'frame-src': ["'self'", 'https://app.netlify.com'],
};

export function buildCsp(context = process.env.CONTEXT) {
  const isPreview = context === 'deploy-preview' || context === 'branch-deploy';
  const directives = { ...BASE, ...(isPreview ? PREVIEW_EXTRAS : {}) };
  return Object.entries(directives)
    .map(([k, v]) => `${k} ${v.join(' ')}`)
    .join('; ');
}

export default function cspHeaders() {
  return {
    name: 'csp-headers',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const csp = buildCsp();
        await writeFile(new URL('_headers', dir), `/*\n  Content-Security-Policy: ${csp}\n`);
        logger.info(`_headers written for context "${process.env.CONTEXT ?? 'local'}" -> ${fileURLToPath(dir)}_headers`);
      },
    },
  };
}
