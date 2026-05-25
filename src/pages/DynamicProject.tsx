import React, { useLayoutEffect, useRef } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import {
	Link,
	Navigate,
	useLocation,
	useParams,
	useSearchParams,
} from "react-router-dom";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { visit } from "unist-util-visit";
import { BlogPostLayout } from "../components/BlogPostLayout";
import { CodeTabs } from "../components/CodeTabs";
import { LiveNhlDashboard } from "../components/LiveNhlDashboard";
import { getProjectBySlug } from "../hooks/useContent";

// Custom Remark plugin to transform directives into HTML nodes that react-markdown can handle
function remarkDirectiveTransformer() {
	// biome-ignore lint/suspicious/noExplicitAny: AST nodes do not have simple standard type exports in remark
	return (tree: any) => {
		visit(tree, (node) => {
			if (
				node.type === "containerDirective" ||
				node.type === "leafDirective" ||
				node.type === "textDirective"
			) {
				if (node.name && /^[a-z]/i.test(node.name)) {
					if (!node.data) node.data = {};
					const data = node.data;
					data.hName = node.name;
					data.hProperties = node.attributes || {};
				} else {
					const prefix =
						node.type === "containerDirective"
							? ":::"
							: node.type === "leafDirective"
								? "::"
								: ":";
					node.type = "text";
					node.value = prefix + node.name;
				}
			}
		});
	};
}

export function DynamicProject() {
	const { slug } = useParams();
	const location = useLocation();
	const [searchParams] = useSearchParams();
	const project = slug ? getProjectBySlug(slug) : undefined;
	const containerRef = useRef<HTMLDivElement>(null);

	const fromPage = searchParams.get("fromPage") || "1";

	useLayoutEffect(() => {
		if (!location.hash) {
			window.scrollTo(0, 0);
		}
	}, [location.hash]);

	useLayoutEffect(() => {
		if (location.hash) {
			const id = location.hash.replace("#", "");

			const scrollToElement = () => {
				const element = document.getElementById(id);
				if (element) {
					element.scrollIntoView({ behavior: "smooth", block: "center" });
				}
			};

			// Scroll immediately, then try again after images might have loaded
			scrollToElement();
			const timeoutId = setTimeout(scrollToElement, 500);
			return () => clearTimeout(timeoutId);
		}
	}, [location.hash]);

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
				backLink={`/projects?page=${fromPage}#${project.slug}`}
				backLabel="Back to Projects"
			>
				{project.slug === "nhl-predictor" && (
					<div className="mb-16 not-prose">
						<LiveNhlDashboard />
					</div>
				)}
				<article className="prose prose-invert max-w-none">
					<ReactMarkdown
						remarkPlugins={[
							remarkGfm,
							remarkMath,
							remarkDirective,
							remarkDirectiveTransformer,
						]}
						rehypePlugins={[rehypeRaw, rehypeKatex]}
						components={
							{
								// biome-ignore lint/suspicious/noExplicitAny: explicit any for react-markdown children prop type compatibility
								"code-tabs": (({ children }: any) => {
									const blocks = (
										Array.isArray(children) ? children : [children]
									)
										// biome-ignore lint/suspicious/noExplicitAny: explicit any for AST children nodes
										.filter((c: any) => c.type === "pre")
										// biome-ignore lint/suspicious/noExplicitAny: explicit any for AST pre elements
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
								}) as React.ElementType,
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
								h4: ({ children }) => (
									<h4 className="text-2xl md:text-3xl mt-12 mb-4 italic text-foreground">
										{children}
									</h4>
								),
								h5: ({ children }) => (
									<h5 className="text-xl md:text-2xl mt-10 mb-4 italic text-foreground">
										{children}
									</h5>
								),
								figure: ({ children }) => {
									const childrenArray = React.Children.toArray(children).filter(
										(child) =>
											typeof child !== "string" || child.trim().length > 0,
									);
									const image = childrenArray[0];
									const caption = childrenArray.slice(1);
									return (
										<figure className="flex flex-col items-center my-12">
											<div className="w-full flex justify-center">{image}</div>
											{caption.length > 0 && (
												<figcaption className="mt-4 text-center italic opacity-60 text-sm md:text-base max-w-3xl">
													{caption}
												</figcaption>
											)}
										</figure>
									);
								},
								ol: ({ children }) => (
									<ol className="list-decimal list-outside space-y-4 my-8 ml-8">
										{children}
									</ol>
								),
								ul: ({ children }) => (
									<ul className="list-disc list-outside space-y-2 my-8 ml-8">
										{children}
									</ul>
								),
								li: ({ children }) => (
									<li className="text-foreground/80 leading-relaxed pl-2 marker:text-accent marker:font-bold">
										{children}
									</li>
								),
								img: ({ src, alt, className, ...props }) => (
									<img
										src={src}
										alt={alt}
										{...props}
										className={
											className ||
											"w-full h-auto rounded-none shadow-2xl border border-foreground/5"
										}
									/>
								),
								a: ({ href, children, ...props }) => {
									const isExternal = href?.startsWith("http");
									if (isExternal) {
										return (
											<a
												href={href}
												target="_blank"
												rel="noopener noreferrer"
												className="text-accent font-bold border-b-2 border-accent/20 hover:border-accent transition-colors"
												{...props}
											>
												{children}
											</a>
										);
									}
									if (href?.startsWith("#")) {
										return (
											<a
												href={href}
												onClick={(e) => {
													e.preventDefault();
													const id = href.replace("#", "");
													const element = document.getElementById(id);
													if (element) {
														element.scrollIntoView({
															behavior: "smooth",
															block: "center",
														});
													}
												}}
												className="text-accent font-bold border-b-2 border-accent/20 hover:border-accent transition-colors"
												{...props}
											>
												{children}
											</a>
										);
									}
									return (
										<Link
											to={href || "#"}
											className="text-accent font-bold border-b-2 border-accent/20 hover:border-accent transition-colors"
											{...props}
										>
											{children}
										</Link>
									);
								},
							} as Components
						}
					>
						{project.content}
					</ReactMarkdown>
				</article>
			</BlogPostLayout>
		</div>
	);
}
