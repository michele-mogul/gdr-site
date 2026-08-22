import type { APIRoute } from 'astro';
import { COLLECTION_META, SITE } from '../../config';
import { loadCollection } from '../../lib/content';
import { buildFeed } from '../../lib/feed';

const meta = COLLECTION_META['reviews'];

export const GET: APIRoute = async (context) =>
  buildFeed(context, {
    title: `${SITE.title} — ${meta.plural}`,
    description: meta.description,
    entries: await loadCollection('reviews'),
  });
