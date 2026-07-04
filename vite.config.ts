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
				// The changed .md file may not be in the module graph at all yet
				// (bodies load lazily), so tell the client to reload rather than
				// relying on Vite to propagate an update for it.
				server.ws.send({ type: "full-reload" });
				return [];
			}
		},
	};
}

const SITE_URL = "https://dylanskinner.dev";

const STATIC_ROUTES = [
	{ path: "/", priority: "1.0" },
	{ path: "/blog", priority: "0.8" },
	{ path: "/projects", priority: "0.8" },
	{ path: "/search", priority: "0.5" },
	{ path: "/live-nhl", priority: "0.5" },
];

function buildSitemapXml(
	blogIndex: { slug: string; date?: string }[],
	projectIndex: { slug: string; date?: string }[],
) {
	const urls: { loc: string; lastmod?: string; priority: string }[] = [
		...STATIC_ROUTES.map(({ path, priority }) => ({
			loc: `${SITE_URL}${path}`,
			priority,
		})),
		...blogIndex.map((entry) => ({
			loc: `${SITE_URL}/blog/${entry.slug}`,
			lastmod: entry.date,
			priority: "0.6",
		})),
		...projectIndex.map((entry) => ({
			loc: `${SITE_URL}/projects/${entry.slug}`,
			lastmod: entry.date,
			priority: "0.6",
		})),
	];

	const body = urls
		.map(
			({ loc, lastmod, priority }) =>
				`  <url>\n    <loc>${loc}</loc>\n${
					lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : ""
				}    <priority>${priority}</priority>\n  </url>`,
		)
		.join("\n");

	return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

const ROBOTS_TXT = `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;

// Emits sitemap.xml + robots.txt from the same content-directory scan the
// content-index plugin uses, so slugs/dates never drift between the two.
function sitemapPlugin(): Plugin {
	function readIndexes() {
		return {
			blogIndex: readContentIndex(
				resolve(rootDir, "src/content/blog"),
				"../content/blog",
			),
			projectIndex: readContentIndex(
				resolve(rootDir, "src/content/projects"),
				"../content/projects",
			),
		};
	}

	return {
		name: "sitemap",
		generateBundle() {
			const { blogIndex, projectIndex } = readIndexes();
			this.emitFile({
				type: "asset",
				fileName: "sitemap.xml",
				source: buildSitemapXml(blogIndex, projectIndex),
			});
			this.emitFile({
				type: "asset",
				fileName: "robots.txt",
				source: ROBOTS_TXT,
			});
		},
		configureServer(server) {
			server.middlewares.use((req, res, next) => {
				if (req.url === "/sitemap.xml") {
					const { blogIndex, projectIndex } = readIndexes();
					res.setHeader("Content-Type", "application/xml");
					res.end(buildSitemapXml(blogIndex, projectIndex));
					return;
				}
				if (req.url === "/robots.txt") {
					res.setHeader("Content-Type", "text/plain");
					res.end(ROBOTS_TXT);
					return;
				}
				next();
			});
		},
	};
}

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), contentIndexPlugin(), sitemapPlugin()],
});
