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
		/** Key into the lazy import.meta.glob("../content/...") in src/hooks/useContent.ts */
		path: string;
	}

	export const blogIndex: ContentIndexEntry[];
	export const projectIndex: ContentIndexEntry[];
}
