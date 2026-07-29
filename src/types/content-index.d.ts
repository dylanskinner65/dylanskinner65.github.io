// Types for the virtual module emitted by the content-index plugin in
// vite.config.ts (frontmatter-only metadata, no markdown bodies).
declare module "virtual:content-index" {
	interface ContentIndexEntry {
		slug: string;
		title: string;
		date: string;
		description: string;
		category: string;
		quote?: string;
		quoteAuthor?: string;
		/** Talks only: where it was given. */
		venue?: string;
		/** Talks only: path to the standalone slide deck under /decks. */
		deck?: string;
		/** Talks only: path to a slides PDF under /public. */
		slides?: string;
		/** Key into the lazy import.meta.glob("../content/...") in src/hooks/useContent.ts */
		path: string;
	}

	export const blogIndex: ContentIndexEntry[];
	export const projectIndex: ContentIndexEntry[];
	export const talkIndex: ContentIndexEntry[];
}
