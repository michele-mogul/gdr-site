import rss, { type RSSFeedItem } from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE } from '../config';
import { toCard, type Entry } from './content';

/** Maps an entry onto an RSS item. Bodies stay out: the feed is a table of contents. */
export function toFeedItem(entry: Entry): RSSFeedItem {
  const card = toCard(entry);
  return {
    title: card.title,
    description: card.excerpt,
    pubDate: card.date,
    link: card.href,
    categories: [...card.tags],
  };
}

/** Builds one feed. Shared by the global feed and the per-collection ones. */
export function buildFeed(
  context: APIContext,
  options: { title: string; description: string; entries: Entry[] },
): Promise<Response> {
  return rss({
    title: options.title,
    description: options.description,
    site: context.site ?? SITE.url,
    items: options.entries.map(toFeedItem),
    customData: `<language>${SITE.lang}</language><copyright>${SITE.copyright}</copyright>`,
    trailingSlash: false,
  });
}
