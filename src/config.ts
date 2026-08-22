/**
 * Global site configuration. Single place for site-wide data:
 * read both by `astro.config.ts` and by the pages.
 */
export const SITE = {
  /**
   * No trailing slash. Used by RSS, sitemap and OpenGraph.
   * Defaults to the GitHub Pages preview; override with the PUBLIC_SITE_URL
   * env var (see astro.config.ts) once a real domain exists.
   */
  url: 'https://michele-mogul.github.io',
  /**
   * Sub-path the site is served from. GitHub Pages project sites live under
   * /<repo>; on a domain of its own this becomes '/'. Override with BASE_PATH.
   */
  base: '/gdr-site',
  title: 'Nome del sito',
  /** Default <meta name="description"> and feed description. */
  description: 'Recensioni di giochi di ruolo, avventure giocabili, racconti e appunti.',
  author: 'Michele Acierno',
  lang: 'it',
  /** Shown as <copyright> in the RSS feeds. */
  copyright: `CC BY-SA 4.0 — ${new Date().getFullYear()}`,
} as const;

/**
 * Giscus comments. With `enabled: false` nothing is rendered and no JS is shipped.
 * The ids come from https://giscus.app once Discussions are enabled on the repo.
 */
export const GISCUS = {
  enabled: false,
  repo: 'michele-mogul/gdr-site',
  repoId: '',
  category: 'Commenti',
  categoryId: '',
  /** Giscus themes, one per site theme: the widget follows the switch. */
  themeLight: 'light',
  themeDark: 'transparent_dark',
  lang: 'it',
} as const;

/** Collection keys. Source of truth for indexes, feeds and tag pages. */
export const COLLECTIONS = ['reviews', 'adventures', 'stories', 'blog'] as const;
export type Collection = (typeof COLLECTIONS)[number];

type CollectionMeta = {
  /** Singular label, for breadcrumbs. */
  singular: string;
  /** Plural label, for menus and page titles. */
  plural: string;
  /** URL segment: /{path}/{slug}. Italian, unlike the collection key. */
  path: string;
  description: string;
};

export const COLLECTION_META: Record<Collection, CollectionMeta> = {
  reviews: {
    singular: 'Recensione',
    plural: 'Recensioni',
    path: 'recensioni',
    description: 'Manuali letti per intero, con voto e giudizio secco.',
  },
  adventures: {
    singular: 'Avventura',
    plural: 'Avventure',
    path: 'avventure',
    description: 'One-shot e avventure pronte al tavolo, spesso con PDF scaricabile.',
  },
  stories: {
    singular: 'Racconto',
    plural: 'Racconti',
    path: 'racconti',
    description: 'Narrativa breve.',
  },
  blog: {
    singular: 'Articolo',
    plural: 'Blog',
    path: 'blog',
    description: 'Pensieri sul gioco, sul design e su quello che capita al tavolo.',
  },
};

/** Words per minute used to estimate `readingTime`. */
export const WORDS_PER_MINUTE = 200;
