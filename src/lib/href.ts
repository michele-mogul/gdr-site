/**
 * Internal links must go through here.
 *
 * The site is built twice from the same source: at the root of a real domain
 * (Cloudflare Pages) and under /gdr-site on GitHub Pages. Astro rewrites the
 * routes it generates, but not the hrefs written by hand, so every internal
 * link is prefixed with `import.meta.env.BASE_URL` here.
 */
const BASE = import.meta.env.BASE_URL;

export function href(path: string): string {
  const base = BASE.endsWith('/') ? BASE.slice(0, -1) : BASE;
  const rest = path.startsWith('/') ? path : `/${path}`;
  return `${base}${rest}` || '/';
}
