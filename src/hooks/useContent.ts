import { blogIndex, projectIndex, talkIndex } from "virtual:content-index";
import { useCallback, useEffect, useState } from "react";

// Frontmatter metadata comes from the build-time index (virtual:content-index,
// see vite.config.ts) so lists render synchronously. The markdown bodies stay
// out of the eager bundle: these lazy globs fetch them on demand, keyed by the
// same relative paths the index stores in each entry's `path` field.
const blogBodies = import.meta.glob<string>("../content/blog/*.md", {
	query: "?raw",
	import: "default",
});

const projectBodies = import.meta.glob<string>("../content/projects/*.md", {
	query: "?raw",
	import: "default",
});

const talkBodies = import.meta.glob<string>("../content/talks/*.md", {
	query: "?raw",
	import: "default",
});

export interface ContentMetadata {
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
}

export type ContentWithBody = ContentMetadata & { content: string };

const FRONTMATTER_REGEX = /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/;

function stripFrontmatter(raw: string): string {
	const match = raw.match(FRONTMATTER_REGEX);
	return match ? match[2] : raw;
}

const bodyCache = new Map<string, string>();

async function loadBody(
	entry: { path: string } | undefined,
	loaders: Record<string, () => Promise<string>>,
): Promise<string | undefined> {
	if (!entry) return undefined;
	const cached = bodyCache.get(entry.path);
	if (cached !== undefined) return cached;
	const loader = loaders[entry.path];
	if (!loader) return undefined;
	const body = stripFrontmatter(await loader());
	bodyCache.set(entry.path, body);
	return body;
}

// Blog Functions
export function getAllPosts(): ContentMetadata[] {
	return blogIndex;
}

export function getPostBySlug(slug: string): ContentMetadata | undefined {
	return blogIndex.find((p) => p.slug === slug);
}

export function loadPostBody(slug: string): Promise<string | undefined> {
	return loadBody(
		blogIndex.find((p) => p.slug === slug),
		blogBodies,
	);
}

export function loadAllPostsWithContent(): Promise<ContentWithBody[]> {
	return Promise.all(
		blogIndex.map(async (entry) => ({
			...entry,
			content: (await loadBody(entry, blogBodies)) ?? "",
		})),
	);
}

// Project Functions
export function getAllProjects(): ContentMetadata[] {
	return projectIndex;
}

export function getProjectBySlug(slug: string): ContentMetadata | undefined {
	return projectIndex.find((p) => p.slug === slug);
}

export function loadProjectBody(slug: string): Promise<string | undefined> {
	return loadBody(
		projectIndex.find((p) => p.slug === slug),
		projectBodies,
	);
}

export function loadAllProjectsWithContent(): Promise<ContentWithBody[]> {
	return Promise.all(
		projectIndex.map(async (entry) => ({
			...entry,
			content: (await loadBody(entry, projectBodies)) ?? "",
		})),
	);
}

// Talk Functions
export function getAllTalks(): ContentMetadata[] {
	return talkIndex;
}

export function getTalkBySlug(slug: string): ContentMetadata | undefined {
	return talkIndex.find((t) => t.slug === slug);
}

export function loadTalkBody(slug: string): Promise<string | undefined> {
	return loadBody(
		talkIndex.find((t) => t.slug === slug),
		talkBodies,
	);
}

export function loadAllTalksWithContent(): Promise<ContentWithBody[]> {
	return Promise.all(
		talkIndex.map(async (entry) => ({
			...entry,
			content: (await loadBody(entry, talkBodies)) ?? "",
		})),
	);
}

export interface ContentBodyState {
	/** Markdown body, or null while loading (or after a failed load). */
	content: string | null;
	/** True when the lazy body fetch rejected (offline, stale deploy, ...). */
	error: boolean;
	retry: () => void;
}

/**
 * Returns the markdown body for a post/project, loading it lazily.
 * Already-fetched bodies resolve synchronously from the module cache so
 * revisiting a page never flashes an empty article; failed fetches surface
 * as `error` with a `retry` instead of leaving the article blank forever.
 */
export function useContentBody(
	type: "blog" | "project" | "talk",
	slug: string | undefined,
): ContentBodyState {
	const key = `${type}:${slug ?? ""}`;
	const [loaded, setLoaded] = useState<{
		key: string;
		body?: string;
		error?: boolean;
	} | null>(null);
	const [attempt, setAttempt] = useState(0);

	// biome-ignore lint/correctness/useExhaustiveDependencies: `attempt` is an intentional extra dependency — bumping it via retry() re-runs the fetch after a failure.
	useEffect(() => {
		if (!slug) return;
		let active = true;
		const load =
			type === "blog"
				? loadPostBody
				: type === "talk"
					? loadTalkBody
					: loadProjectBody;
		load(slug).then(
			(body) => {
				if (active && body !== undefined) {
					setLoaded({ key: `${type}:${slug}`, body });
				}
			},
			() => {
				if (active) {
					setLoaded({ key: `${type}:${slug}`, error: true });
				}
			},
		);
		return () => {
			active = false;
		};
	}, [type, slug, attempt]);

	const retry = useCallback(() => {
		setLoaded(null);
		setAttempt((n) => n + 1);
	}, []);

	if (loaded?.key === key) {
		return {
			content: loaded.body ?? null,
			error: Boolean(loaded.error),
			retry,
		};
	}
	const index =
		type === "blog" ? blogIndex : type === "talk" ? talkIndex : projectIndex;
	const entry = index.find((e) => e.slug === slug);
	return {
		content: entry ? (bodyCache.get(entry.path) ?? null) : null,
		error: false,
		retry,
	};
}
