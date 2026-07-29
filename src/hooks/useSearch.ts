import type Fuse from "fuse.js";
import type { FuseResult } from "fuse.js";
import { useEffect, useMemo, useState } from "react";
import {
	loadAllPostsWithContent,
	loadAllProjectsWithContent,
	loadAllTalksWithContent,
} from "./useContent";

export type SearchItem = {
	slug: string;
	title: string;
	date: string;
	description: string;
	type: "blog" | "project" | "talk";
	category?: string;
	tags?: string[];
	content: string;
};

// One shared index for the whole app (CommandPalette + Search page). Built on
// first use only: constructing it pulls every markdown body plus fuse.js over
// the network, so nothing here loads eagerly with the entry bundle.
let indexPromise: Promise<Fuse<SearchItem>> | null = null;

function loadSearchIndex(): Promise<Fuse<SearchItem>> {
	if (!indexPromise) {
		const promise = (async () => {
			const [{ default: FuseCtor }, posts, projects, talks] = await Promise.all(
				[
					import("fuse.js"),
					loadAllPostsWithContent(),
					loadAllProjectsWithContent(),
					loadAllTalksWithContent(),
				],
			);
			const searchData: SearchItem[] = [
				...posts.map((post) => ({
					slug: post.slug,
					title: post.title,
					date: post.date,
					description: post.description,
					category: post.category,
					content: post.content,
					type: "blog" as const,
				})),
				...projects.map((project) => ({
					slug: project.slug,
					title: project.title,
					date: project.date,
					description: project.description,
					category: project.category,
					content: project.content,
					type: "project" as const,
				})),
				...talks.map((talk) => ({
					slug: talk.slug,
					title: talk.title,
					date: talk.date,
					description: talk.description,
					category: talk.category,
					content: talk.content,
					type: "talk" as const,
				})),
			];
			return new FuseCtor(searchData, {
				keys: [
					{ name: "title", weight: 2 },
					{ name: "description", weight: 1 },
					{ name: "tags", weight: 1 },
					{ name: "category", weight: 1 },
					{ name: "content", weight: 0.5 },
				],
				threshold: 0.3,
				ignoreLocation: true,
				includeMatches: true,
			});
		})();
		// Don't memoize a rejected build (flaky body fetch, stale chunk after a
		// redeploy): reset so the next palette open / Search visit can retry.
		promise.catch(() => {
			indexPromise = null;
		});
		indexPromise = promise;
	}
	return indexPromise;
}

export interface SearchState {
	results: FuseResult<SearchItem>[];
	/** False while the index is still building — distinct from "no matches". */
	ready: boolean;
	/** True when the index build failed; retried on the next enable. */
	failed: boolean;
}

export function useSearch(query: string, enabled = true): SearchState {
	const [fuse, setFuse] = useState<Fuse<SearchItem> | null>(null);
	const [failed, setFailed] = useState(false);

	useEffect(() => {
		if (!enabled || fuse) return;
		let active = true;
		setFailed(false);
		loadSearchIndex().then(
			(instance) => {
				if (active) setFuse(instance);
			},
			() => {
				if (active) setFailed(true);
			},
		);
		return () => {
			active = false;
		};
	}, [enabled, fuse]);

	const results = useMemo(() => {
		if (!query || !fuse) return [];
		return fuse.search(query);
	}, [fuse, query]);

	return { results, ready: fuse !== null, failed };
}
