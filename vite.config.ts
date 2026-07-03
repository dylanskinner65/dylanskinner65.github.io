import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import { parse } from "yaml";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

const FRONTMATTER_REGEX = /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/;

// Parses frontmatter for every markdown file at build time so pages can
// render titles/dates/descriptions without shipping the (much larger)
// markdown bodies in an eager chunk. Bodies are loaded on demand through a
// lazy import.meta.glob in src/hooks/useContent.ts, whose keys match the
// `path` field emitted here.
function readContentIndex(dir: string, globPrefix: string) {
	return readdirSync(dir)
		.filter((file) => file.endsWith(".md"))
		.sort()
		.map((file) => {
			const raw = readFileSync(resolve(dir, file), "utf-8");
			const match = raw.match(FRONTMATTER_REGEX);
			const data = match ? parse(match[1]) || {} : {};
			return { ...data, path: `${globPrefix}/${file}` };
		});
}

function contentIndexPlugin(): Plugin {
	const virtualId = "virtual:content-index";
	const resolvedVirtualId = `\0${virtualId}`;

	return {
		name: "content-index",
		resolveId(id) {
			if (id === virtualId) return resolvedVirtualId;
		},
		load(id) {
			if (id !== resolvedVirtualId) return;
			const blogIndex = readContentIndex(
				resolve(rootDir, "src/content/blog"),
				"../content/blog",
			);
			const projectIndex = readContentIndex(
				resolve(rootDir, "src/content/projects"),
				"../content/projects",
			);
			return [
				`export const blogIndex = ${JSON.stringify(blogIndex)};`,
				`export const projectIndex = ${JSON.stringify(projectIndex)};`,
			].join("\n");
		},
		handleHotUpdate({ file, server }) {
			if (file.includes("/src/content/") && file.endsWith(".md")) {
				const mod = server.moduleGraph.getModuleById(resolvedVirtualId);
				if (mod) server.moduleGraph.invalidateModule(mod);
			}
		},
	};
}

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), contentIndexPlugin()],
});
