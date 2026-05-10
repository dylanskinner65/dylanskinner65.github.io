import { useLayoutEffect, useRef } from "react";
import { Navigate, useParams } from "react-router-dom";
import { BlogPostLayout } from "../components/BlogPostLayout";
import { renderContent } from "../components/ContentParser";
import contentData from "../data/content.json";

declare global {
	interface Window {
		// biome-ignore lint/suspicious/noExplicitAny: External library global
		MathJax: any;
	}
}

export function DynamicPost() {
	const { slug } = useParams();
	const post = contentData.blog.find((p) => p.slug === slug);
	const containerRef = useRef<HTMLDivElement>(null);

	useLayoutEffect(() => {
		const { MathJax } = window;

		if (MathJax && containerRef.current) {
			// 1. Clear previous labels to prevent "multiply defined" errors
			if (MathJax.texLabelsClear) {
				MathJax.texLabelsClear();
			}

			// 2. Clear previous typesetting for this container
			if (MathJax.typesetClear) {
				MathJax.typesetClear([containerRef.current]);
			}

			// 3. Queue the typesetting
			MathJax.startup.promise = MathJax.startup.promise
				.then(() => {
					return MathJax.typesetPromise([containerRef.current]);
				})
				// biome-ignore lint/suspicious/noExplicitAny: library error handler
				.catch((err: any) => console.error("MathJax typesetting failed:", err));
		}
	}, []);

	if (!post) {
		return <Navigate to="/blog" replace />;
	}

	return (
		<div ref={containerRef}>
			<BlogPostLayout
				title={post.title}
				date={post.date}
				slug={post.slug}
				category={post.category}
				excerpt={post.description || "Technical exploration."}
				quote={post.quote}
				quoteAuthor={post.quoteAuthor}
			>
				{renderContent(post.content)}
			</BlogPostLayout>
		</div>
	);
}
