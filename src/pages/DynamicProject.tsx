import { useLayoutEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Link, Navigate, useParams } from "react-router-dom";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { visit } from "unist-util-visit";
import { BlogPostLayout } from "../components/BlogPostLayout";
import { CodeTabs } from "../components/CodeTabs";
import { getProjectBySlug } from "../hooks/useContent";

// Custom Remark plugin to transform directives into HTML nodes that react-markdown can handle
function remarkDirectiveTransformer() {
	// biome-ignore lint/suspicious/noExplicitAny: complex unist tree type
	return (tree: any) => {
		visit(tree, (node) => {
			if (
				node.type === "containerDirective" ||
				node.type === "leafDirective" ||
				node.type === "textDirective"
			) {
				if (!node.data) node.data = {};
				const data = node.data;
				data.hName = node.name;
				data.hProperties = node.attributes || {};
			}
		});
	};
}

export function DynamicProject() {
	const { slug } = useParams();
	const project = slug ? getProjectBySlug(slug) : undefined;
	const containerRef = useRef<HTMLDivElement>(null);

	useLayoutEffect(() => {
		window.scrollTo(0, 0);
	}, []);

	if (!project) {
		return <Navigate to="/projects" replace />;
	}

	return (
		<div ref={containerRef}>
			<BlogPostLayout
				title={project.title}
				date={project.date}
				slug={project.slug}
				category={project.category}
				excerpt={project.description || "Project exploration."}
				quote={project.quote}
				quoteAuthor={project.quoteAuthor}
			>
				<article className="prose prose-invert max-w-none">
					<ReactMarkdown
						remarkPlugins={[
							remarkGfm,
							remarkMath,
							remarkDirective,
							remarkDirectiveTransformer,
						]}
						rehypePlugins={[rehypeRaw, rehypeKatex]}
						components={{
							// Map the 'code-tabs' directive to our CodeTabs component
							// @ts-expect-error
							// biome-ignore lint/suspicious/noExplicitAny: react-markdown component type
							"code-tabs": ({ children }: any) => {
								const blocks = (Array.isArray(children) ? children : [children])
									// biome-ignore lint/suspicious/noExplicitAny: complex react element type
									.filter((c: any) => c.type === "pre")
									// biome-ignore lint/suspicious/noExplicitAny: complex react element type
									.map((pre: any) => {
										const codeChild = pre.props.children;
										const className = codeChild?.props?.className || "";
										const lang = className.replace("language-", "") || "text";
										const label =
											lang === "python"
												? "Python"
												: lang === "typescript" || lang === "javascript"
													? "TypeScript"
													: lang.toUpperCase();
										return {
											lang,
											label,
											code: codeChild?.props?.children || "",
										};
									});
								return <CodeTabs blocks={blocks} />;
							},
							// Custom Heading styles
							h2: ({ children }) => (
								<h2 className="text-4xl md:text-5xl mt-20 mb-8 italic border-b-2 border-foreground/5 pb-4 text-foreground">
									{children}
								</h2>
							),
							h3: ({ children }) => (
								<h3 className="text-3xl md:text-4xl mt-16 mb-6 italic text-foreground">
									{children}
								</h3>
							),
							// Images
							img: ({ src, alt, className, ...props }) => (
								<img
									src={src}
									alt={alt}
									{...props}
									className={
										className ||
										"w-full h-auto rounded-none shadow-2xl border border-foreground/5 my-12"
									}
								/>
							),
							// Links: Use React Router Link for internal links
							a: ({ href, children, ...props }) => {
								const isInternal =
									href?.startsWith("/") ||
									href?.startsWith("http://localhost") ||
									href?.startsWith("https://dylanskinner65.github.io");

								let cleanHref =
									href?.replace("https://dylanskinner65.github.io", "") || "";

								// Sanitize legacy paths: /blog/post_name.html -> /blog/post-name
								if (
									isInternal &&
									(cleanHref.includes("/blog/") ||
										cleanHref.includes("/projects/"))
								) {
									cleanHref = cleanHref.replace(".html", "").replace(/_/g, "-");
								}

								const className =
									"text-accent font-bold border-b-2 border-accent/20 hover:border-accent transition-colors";

								if (isInternal) {
									return (
										<Link
											to={cleanHref}
											className={className}
											target="_blank"
											rel="noopener noreferrer"
											{...props}
										>
											{children}
										</Link>
									);
								}
								return (
									<a
										href={href}
										target="_blank"
										rel="noopener noreferrer"
										className={className}
										{...props}
									>
										{children}
									</a>
								);
							},
						}}
					>
						{project.content}
					</ReactMarkdown>
				</article>
			</BlogPostLayout>
		</div>
	);
}
