import { parse } from "yaml";

// Vite's import.meta.glob allows us to find all .md files in the content directory
const blogModules = import.meta.glob("../content/blog/*.md", {
	query: "?raw",
	import: "default",
	eager: true,
});

const projectModules = import.meta.glob("../content/projects/*.md", {
	query: "?raw",
	import: "default",
	eager: true,
});

export interface ContentMetadata {
	slug: string;
	title: string;
	date: string;
	description: string;
	category: string;
	quote?: string;
	quoteAuthor?: string;
	content: string;
}

function parseFrontmatter(fileContent: string) {
	const FRONTMATTER_REGEX = /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/;
	const match = fileContent.match(FRONTMATTER_REGEX);

	if (!match) {
		return { data: {}, content: fileContent };
	}

	const [_, yamlStr, body] = match;

	try {
		const data = parse(yamlStr) || {};
		return { data, content: body };
	} catch (e) {
		console.error("Frontmatter parsing failed:", e);
		return { data: {}, content: body };
	}
}

// Blog Functions
export function getAllPosts(): ContentMetadata[] {
	return Object.entries(blogModules).map(([_, content]) => {
		const { data, content: body } = parseFrontmatter(content as string);
		return {
			...(data as Omit<ContentMetadata, "content">),
			content: body,
		};
	});
}

export function getPostBySlug(slug: string): ContentMetadata | undefined {
	const posts = getAllPosts();
	return posts.find((p) => p.slug === slug);
}

// Project Functions
export function getAllProjects(): ContentMetadata[] {
	return Object.entries(projectModules).map(([_, content]) => {
		const { data, content: body } = parseFrontmatter(content as string);
		return {
			...(data as Omit<ContentMetadata, "content">),
			content: body,
		};
	});
}

export function getProjectBySlug(slug: string): ContentMetadata | undefined {
	const projects = getAllProjects();
	return projects.find((p) => p.slug === slug);
}
