import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { SITE } from './src/config';

// https://astro.build/config
export default defineConfig({
  site: SITE.url,
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
