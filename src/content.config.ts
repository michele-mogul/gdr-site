import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { globWithReadingTime } from './loaders/glob-with-reading-time';

/*
 * Schemas for the four collections.
 *
 * Rule of thumb: everything needed to render the page, the feed or the card is
 * required. Objects are `.strict()`, so a misspelled frontmatter key fails the
 * build instead of silently disappearing.
 *
 * Field names are English (they are code); their values, and the prose around
 * them, are Italian.
 */

const CURRENT_YEAR = new Date().getFullYear();

/** At least one tag; lowercased and deduped so /tag/<slug> works. */
const tags = z
  .array(z.string().min(1).max(40))
  .min(1, 'Serve almeno un tag: i tag sono la navigazione trasversale del sito.')
  .transform((values) => [...new Set(values.map((v) => v.trim().toLowerCase()))]);

/** Inclusive integer range, e.g. levels 1-3 or 3-5 players. */
const range = (label: string, lowest: number, highest: number) =>
  z
    .object({
      min: z.number().int().min(lowest).max(highest),
      max: z.number().int().min(lowest).max(highest),
    })
    .strict()
    .refine((v) => v.max >= v.min, {
      message: `${label}: "max" non può essere minore di "min".`,
    });

/** Fields shared by all four collections. */
const commonFields = {
  title: z.string().min(1).max(140),
  /** Publication date. In YAML both 2026-03-14 and "2026-03-14" work. */
  date: z.coerce.date(),
  tags,
  /** Teaser used on the homepage, indexes, feeds and meta description. */
  excerpt: z.string().min(1).max(320),
  /** With `true` the entry only exists in `astro dev`. */
  draft: z.boolean().default(false),
  /** Optional: overrides the URL slug otherwise derived from the filename. */
  slug: z.string().min(1).optional(),
};

const reviews = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/reviews' }),
  schema: ({ image }) =>
    z
      .object({
        ...commonFields,
        /** Game or line under review, e.g. "Mörk Borg". */
        system: z.string().min(1),
        publisher: z.string().min(1),
        year: z.number().int().min(1974).max(CURRENT_YEAR + 1),
        pages: z.number().int().positive().max(5000),
        /** 1-5, half points allowed (3.5). */
        rating: z.number().min(1).max(5).multipleOf(0.5),
        format: z.enum(['cartaceo', 'pdf', 'entrambi']),
        /** Image under src/assets, referenced relative to the .mdx file. */
        cover: image(),
        coverAlt: z.string().min(1, 'Descrivi la copertina per chi non la vede.'),
      })
      .strict(),
});

const adventures = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/adventures' }),
  schema: ({ image }) =>
    z
      .object({
        ...commonFields,
        system: z.string().min(1),
        levels: range('levels', 1, 20),
        players: range('players', 1, 12),
        hours: z.number().positive().max(100),
        /** Absolute URL of the PDF on Cloudflare R2. When set, the page shows the download button. */
        pdf: z.url().optional(),
        /** File size shown next to the button, e.g. "4,2 MB". */
        pdfSize: z.string().min(1).optional(),
        image: image(),
        imageAlt: z.string().min(1, "Descrivi l'immagine per chi non la vede."),
      })
      .strict(),
});

const stories = defineCollection({
  loader: globWithReadingTime({ pattern: '**/*.{md,mdx}', base: './src/content/stories' }),
  schema: z
    .object({
      ...commonFields,
      /** Computed by the loader from the body: do not write it in frontmatter. */
      readingTime: z.number().int().nonnegative().default(0),
    })
    .strict(),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: ({ image }) =>
    z
      .object({
        ...commonFields,
        /** Optional: when set it shows on the card and in the OpenGraph tags. */
        image: image().optional(),
        imageAlt: z.string().min(1).optional(),
      })
      .strict()
      .refine((v) => !v.image || Boolean(v.imageAlt), {
        message: 'Se metti `image` devi mettere anche `imageAlt`.',
        path: ['imageAlt'],
      }),
});

export const collections = { reviews, adventures, stories, blog };
