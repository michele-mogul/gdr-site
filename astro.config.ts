import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { SITE } from './src/config';

// https://astro.build/config
/*
 * Both the origin and the sub-path are overridable from the environment, so the
 * same source builds for GitHub Pages (michele-mogul.github.io/gdr-site) and,
 * later, for a domain of its own:
 *
 *   PUBLIC_SITE_URL=https://esempio.it BASE_PATH=/ npm run build
 */
const site = process.env.PUBLIC_SITE_URL ?? SITE.url;
const base = process.env.BASE_PATH ?? SITE.base;

export default defineConfig({
  site,
  base,
  // No hydrated islands by default: JS is opted into with client:visible
  // on the few components that actually need it (Giscus).
  prefetch: false,
  integrations: [mdx(), sitemap()],
  markdown: {
    // GFM and smart punctuation are on by default in Astro 7's Sätteri
    // processor, so only the syntax-highlighting theme is needed here.
    shikiConfig: {
      theme: 'github-dark-default',
      wrap: true,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
