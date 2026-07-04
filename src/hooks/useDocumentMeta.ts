import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_URL = "https://dylanskinner.dev";
const DEFAULT_DESCRIPTION =
	"Dylan Skinner is an AI Engineer and researcher exploring agentic AI systems and 4D topological manifold analysis.";
const DEFAULT_IMAGE = "/me.webp";

export interface DocumentMeta {
	title: string;
	description?: string;
	image?: string;
}

function setMetaContent(selector: string, content: string) {
	const el = document.querySelector<HTMLMetaElement>(selector);
	if (el) el.content = content;
}

/**
 * Hand-rolled per-route SEO: sets document.title and mirrors it into the
 * static OG/Twitter/description tags declared in index.html. This is a
 * client-side, post-hydration update — non-JS crawlers on this SPA only see
 * the static index.html tags, not these per-route values. Full fidelity
 * would require prerendering, which is out of scope here.
 */
export function useDocumentMeta({
	title,
	description = DEFAULT_DESCRIPTION,
	image = DEFAULT_IMAGE,
}: DocumentMeta) {
	const location = useLocation();

	useEffect(() => {
		document.title = title;
		const url = `${SITE_URL}${location.pathname}`;
		const absoluteImage = image.startsWith("http")
			? image
			: `${SITE_URL}${image}`;

		setMetaContent('meta[name="description"]', description);
		setMetaContent('meta[property="og:title"]', title);
		setMetaContent('meta[property="og:description"]', description);
		setMetaContent('meta[property="og:url"]', url);
		setMetaContent('meta[property="og:image"]', absoluteImage);
		setMetaContent('meta[name="twitter:title"]', title);
		setMetaContent('meta[name="twitter:description"]', description);
		setMetaContent('meta[name="twitter:image"]', absoluteImage);

		const canonical = document.querySelector<HTMLLinkElement>(
			'link[rel="canonical"]',
		);
		if (canonical) canonical.href = url;
	}, [title, description, image, location.pathname]);
}
