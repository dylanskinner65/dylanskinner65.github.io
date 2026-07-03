import type Fuse from "fuse.js";
import { useEffect, useMemo, useState } from "react";
import {
	loadAllPostsWithContent,
	loadAllProjectsWithContent,
} from "./useContent";

export type SearchItem = {
	slug: string;
	title: string;
	date: string;
	description: string;
	type: "blog" | "project";
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
		indexPromise = (async () => {
			const [{ default: FuseCtor }, posts, projects] = await Promise.all([
				import("fuse.js"),
				loadAllPostsWithContent(),
				loadAllProjectsWithContent(),
			]);
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
	}
	return indexPromise;
}

export function useSearch(query: string, enabled = true) {
	const [fuse, setFuse] = useState<Fuse<SearchItem> | null>(null);

	useEffect(() => {
		if (!enabled || fuse) return;
		let active = true;
		loadSearchIndex().then((instance) => {
			if (active) setFuse(instance);
		});
		return () => {
			active = false;
		};
	}, [enabled, fuse]);

	return useMemo(() => {
		if (!query || !fuse) return [];
		return fuse.search(query);
	}, [fuse, query]);
}
