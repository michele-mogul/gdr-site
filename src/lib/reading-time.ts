import { WORDS_PER_MINUTE } from '../config';

/**
 * Counts the words of a Markdown/MDX source, skipping what nobody reads:
 * code blocks, component JSX tags, imports, link targets and inline syntax.
 */
export function countWords(source: string): number {
  const text = source
    .replace(/```[\s\S]*?```/g, ' ') // fenced code
    .replace(/`[^`]*`/g, ' ') // inline code
    .replace(/^import\s.+$/gm, ' ') // MDX imports
    .replace(/<[^>]+>/g, ' ') // JSX/HTML tags
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1') // links and images: keep the label
    .replace(/[#>*_~|-]/g, ' ') // Markdown punctuation
    .trim();

  if (text.length === 0) return 0;
  return text.split(/\s+/).length;
}

/** Reading time in minutes, rounded up, never below 1. */
export function readingTime(source: string): number {
  const words = countWords(source);
  if (words === 0) return 1;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}
