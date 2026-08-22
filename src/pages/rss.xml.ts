import type { APIRoute } from 'astro';
import { SITE } from '../config';
import { loadEverything } from '../lib/content';
import { buildFeed } from '../lib/feed';

/** Global feed: every collection, newest first. */
export const GET: APIRoute = async (context) =>
  buildFeed(context, {
    title: SITE.title,
    description: SITE.description,
    entries: await loadEverything(),
  });
