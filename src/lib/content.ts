import { getCollection, type CollectionEntry } from 'astro:content';
import { COLLECTIONS, COLLECTION_META, type Collection } from '../config';

/**
 * Drafts are visible only under `astro dev`. In a build (`import.meta.env.PROD`)
 * they disappear from pages, indexes, feeds, sitemap and tag pages: an entry
 * with `draft: true` simply does not exist.
 */
export const showDrafts = import.meta.env.DEV;

/** Any entry, carrying its collection: the type that flows through mixed lists. */
export type Entry = {
  [C in Collection]: CollectionEntry<C>;
}[Collection];

/** Like `getCollection`, already draft-filtered and sorted newest first. */
export async function loadCollection<C extends Collection>(
  collection: C,
): Promise<CollectionEntry<C>[]> {
  const entries = await getCollection(collection, ({ data }) => showDrafts || !data.draft);
  return entries.sort(byDateDesc);
}

/** Every collection merged and sorted by date: homepage and global feed. */
export async function loadEverything(): Promise<Entry[]> {
  const groups = await Promise.all(COLLECTIONS.map((c) => loadCollection(c)));
  return groups.flat().sort(byDateDesc);
}

function byDateDesc(a: { data: { date: Date } }, b: { data: { date: Date } }): number {
  return b.data.date.valueOf() - a.data.date.valueOf();
}

/** Slug used by the /tag/<slug> URLs. */
export function tagSlug(tag: string): string {
  return tag
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Tag index across every collection: slug -> label + entries. */
export async function tagIndex(): Promise<Map<string, { label: string; entries: Entry[] }>> {
  const everything = await loadEverything();
  const index = new Map<string, { label: string; entries: Entry[] }>();

  for (const entry of everything) {
    for (const tag of entry.data.tags) {
      const slug = tagSlug(tag);
      const group = index.get(slug);
      if (group) {
        group.entries.push(entry);
      } else {
        index.set(slug, { label: tag, entries: [entry] });
      }
    }
  }

  return index;
}

/** Canonical path of an entry. Collection keys are English, URL segments Italian. */
export function entryPath(entry: Entry): string {
  return `/${COLLECTION_META[entry.collection].path}/${entry.id}`;
}
