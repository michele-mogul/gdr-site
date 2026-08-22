import { glob } from 'astro/loaders';
import type { Loader, LoaderContext } from 'astro/loaders';
import { readingTime } from '../lib/reading-time';

type GlobOptions = Parameters<typeof glob>[0];

/**
 * `glob()` plus a `readingTime` computed from the entry body.
 *
 * The field is never authored in frontmatter: the schema declares it with
 * `.default(0)` (so it types as `number`, not `number | undefined`) and this
 * loader overwrites it after validation.
 *
 * Note: entries are re-stored without their `digest`, otherwise `glob()` would
 * skip them on the next load (identical digest) and the update would be
 * dropped. Costs one re-parse in dev, nothing in a cold build.
 */
export function globWithReadingTime(options: GlobOptions): Loader {
  const base = glob(options);

  return {
    name: 'glob-with-reading-time',
    load: async (context: LoaderContext) => {
      await base.load(context);

      for (const [, entry] of context.store.entries()) {
        const { digest: _digest, ...rest } = entry;
        context.store.set({
          ...rest,
          data: { ...entry.data, readingTime: readingTime(entry.body ?? '') },
        });
      }
    },
  };
}
