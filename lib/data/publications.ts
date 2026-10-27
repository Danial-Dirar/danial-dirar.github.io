/**
 * Peer-reviewed publications, newest first — the compact list on /about.
 *
 * Derived from `research.ts`, which is the single source of truth for papers,
 * so titles, authors and DOIs cannot drift apart between the two pages.
 * `doi` is always sent through the canonical https://doi.org/<doi> resolver
 * so links survive publisher URL changes.
 */
import { doiUrl, research } from "./research";

export type Publication = {
  title: string;
  authors: { name: string; self?: boolean }[];
  venue: string;
  year: number;
  doi: string;
  /** Short, human label for the contribution type. */
  type: string;
};

export const publications: Publication[] = research
  .filter((p) => p.status === "published" && p.doi)
  .map((p) => ({
    title: p.title,
    authors: p.authors.map(({ name, self }) => ({ name, self })),
    venue: p.venue,
    year: p.year,
    doi: p.doi as string,
    type: "Journal article",
  }));

export { doiUrl };
