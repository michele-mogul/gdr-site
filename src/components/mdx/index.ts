import Statblock from './Statblock.astro';
import TabellaIncontri from './TabellaIncontri.astro';
import Citazione from './Citazione.astro';

/**
 * Components every .mdx entry can use without importing anything: the entry
 * layout passes this map to `<Content components={mdxComponents} />`.
 *
 * The names are the ones authors type in the content, so they stay Italian.
 */
export const mdxComponents = { Statblock, TabellaIncontri, Citazione };
