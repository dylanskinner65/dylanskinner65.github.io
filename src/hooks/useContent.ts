import { blogIndex, projectIndex } from "virtual:content-index";
import { useEffect, useState } from "react";

// Frontmatter metadata comes from the build-time index (virtual:content-index,
// see vite.config.ts) so lists render synchronously. The markdown bodies stay
// out of the eager bundle: these lazy globs fetch them on demand, keyed by the
// same relative paths the index stores in each entry's `path` field.
const blogBodies = import.meta.glob("../content/blog/*.md", {
	query: "?raw",
	import: "default",
});

const projectBodies = import.meta.glob("../content/projects/*.md", {
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
	loaders: Record<string, () => Promise<unknown>>,
): Promise<string | undefined> {
	if (!entry) return undefined;
	const cached = bodyCache.get(entry.path);
	if (cached !== undefined) return cached;
	const loader = loaders[entry.path];
	if (!loader) return undefined;
	const body = stripFrontmatter((await loader()) as string);
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

/**
 * Returns the markdown body for a post/project, or null while it loads.
 * Already-fetched bodies resolve synchronously from the module cache so
 * revisiting a page never flashes an empty article.
 */
export function useContentBody(
	type: "blog" | "project",
	slug: string | undefined,
): string | null {
	const key = `${type}:${slug ?? ""}`;
	const [loaded, setLoaded] = useState<{ key: string; body: string } | null>(
		null,
	);

	useEffect(() => {
		if (!slug) return;
		let active = true;
		const load = type === "blog" ? loadPostBody : loadProjectBody;
		load(slug).then((body) => {
			if (active && body !== undefined) {
				setLoaded({ key: `${type}:${slug}`, body });
			}
		});
		return () => {
			active = false;
		};
	}, [type, slug]);

	if (loaded?.key === key) return loaded.body;
	const index = type === "blog" ? blogIndex : projectIndex;
	const entry = index.find((e) => e.slug === slug);
	return entry ? (bodyCache.get(entry.path) ?? null) : null;
}
