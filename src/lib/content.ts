import { getCollection, type CollectionEntry } from 'astro:content';
import type { ImageMetadata } from 'astro';
import { href } from './href';
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
  return href(`/${COLLECTION_META[entry.collection].path}/${entry.id}`);
}

/** Everything a card needs, flattened out of the four different shapes. */
export type Card = {
  href: string;
  title: string;
  date: Date;
  excerpt: string;
  tags: readonly string[];
  /** Collection label shown as the kicker, e.g. "Recensione". */
  kicker: string;
  draft: boolean;
  image?: ImageMetadata;
  imageAlt?: string;
  /** Reviews only. */
  rating?: number;
  /** Stories only. */
  readingTime?: number;
  /** Adventures only: presence means there is a PDF to download. */
  pdf?: string;
};

/** Normalises any entry into the shape lists and cards consume. */
export function toCard(entry: Entry): Card {
  const base = {
    href: entryPath(entry),
    title: entry.data.title,
    date: entry.data.date,
    excerpt: entry.data.excerpt,
    tags: entry.data.tags,
    kicker: COLLECTION_META[entry.collection].singular,
    draft: entry.data.draft,
  };

  switch (entry.collection) {
    case 'reviews':
      return {
        ...base,
        image: entry.data.cover,
        imageAlt: entry.data.coverAlt,
        rating: entry.data.rating,
      };
    case 'adventures':
      return {
        ...base,
        image: entry.data.image,
        imageAlt: entry.data.imageAlt,
        ...(entry.data.pdf ? { pdf: entry.data.pdf } : {}),
      };
    case 'stories':
      return { ...base, readingTime: entry.data.readingTime };
    case 'blog':
      return {
        ...base,
        ...(entry.data.image ? { image: entry.data.image, imageAlt: entry.data.imageAlt } : {}),
      };
  }
}

/** Italian date, e.g. "14 marzo 2026". */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('it-IT', { dateStyle: 'long', timeZone: 'UTC' }).format(date);
}

/** Machine-readable date for <time datetime>. */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** getStaticPaths body for a collection's detail pages. */
export async function collectionPaths<C extends Collection>(collection: C) {
  const entries = await loadCollection(collection);
  return entries.map((entry) => ({ params: { slug: entry.id }, props: { entry } }));
}
