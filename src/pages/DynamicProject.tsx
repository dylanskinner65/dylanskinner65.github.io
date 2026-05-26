import { Activity, ArrowRight } from "lucide-react";
import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import {
	Link,
	Navigate,
	useLocation,
	useParams,
	useSearchParams,
} from "react-router-dom";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
	oneDark,
	oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { visit } from "unist-util-visit";
import { BlogPostLayout } from "../components/BlogPostLayout";
import { CodeTabs } from "../components/CodeTabs";
import { useTheme } from "../hooks/ThemeContext";
import { getProjectBySlug } from "../hooks/useContent";

function CopyCodeBlock({
	language,
	value,
	...props
}: {
	language: string;
	value: string;
	[key: string]: any;
}) {
	const { resolvedTheme } = useTheme();
	const [copied, setCopied] = useState(false);

	const handleCopy = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(value);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy text: ", err);
		}
	}, [value]);

	const syntaxTheme = resolvedTheme === "dark" ? oneDark : oneLight;

	return (
		<div className="my-12 border border-foreground/10 bg-foreground/5 shadow-2xl overflow-hidden rounded-lg font-sans not-prose w-full">
			<div className="flex justify-between items-center px-6 py-3 bg-foreground/5 border-b border-foreground/5 text-[10px] text-foreground/50 font-bold select-none tracking-widest uppercase">
				<span>{language || "code"}</span>
				<button
					type="button"
					onClick={handleCopy}
					className="flex items-center gap-2 hover:text-accent transition-colors duration-200 cursor-pointer active:scale-95 shrink-0"
				>
					{copied ? (
						<span className="text-emerald-500 font-black">COPIED!</span>
					) : (
						<span>COPY</span>
					)}
				</button>
			</div>
			<div className="w-full overflow-hidden">
				<SyntaxHighlighter
					language={language}
					style={syntaxTheme}
					customStyle={{
						padding: "1.5rem",
						background: "transparent",
						margin: 0,
						fontSize: "0.85rem",
						lineHeight: "1.7",
						overflowX: "auto",
						maxWidth: "100%",
					}}
					{...props}
				>
					{value}
				</SyntaxHighlighter>
			</div>
		</div>
	);
}

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
					<div className="mb-16 not-prose p-8 sm:p-12 border-2 border-accent/20 bg-accent-soft backdrop-blur-md rounded-none relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-8 shadow-2xl group">
						{/* Ambient accent background glow */}
						<div className="absolute -right-24 -top-24 w-48 h-48 rounded-full bg-accent/10 blur-3xl pointer-events-none group-hover:scale-150 transition-transform duration-700"></div>

						<div className="space-y-4 relative z-10">
							<div className="flex items-center gap-3">
								<span className="text-[9px] font-black text-accent uppercase tracking-widest bg-accent/10 border border-accent/25 px-3 py-1 rounded-none flex items-center gap-1.5">
									<span className="relative flex h-1.5 w-1.5 shrink-0">
										<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
										<span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent"></span>
									</span>
									Interactive Live Dashboard
								</span>
								<span className="text-[9px] font-bold text-foreground/40 uppercase tracking-widest italic">
									Active homelab container
								</span>
							</div>

							<h3 className="text-2xl sm:text-3xl md:text-4xl italic text-foreground tracking-tight leading-none uppercase font-black">
								Real-Time Win Predictor
							</h3>

							<p className="text-sm sm:text-base text-foreground/75 italic font-light max-w-2xl leading-relaxed">
								A live tracker performing sub-millisecond dynamic XGBoost &
								rolling Bayesian calculations. View live schedule, event
								scrubbing logs, and real-time win probability curves.
							</p>
						</div>

						<Link
							to="/live-nhl"
							className="relative z-10 shrink-0 inline-flex items-center gap-3 px-8 py-5 bg-foreground text-background hover:bg-accent hover:text-white font-black uppercase tracking-widest text-[10px] sm:text-xs transition-all duration-300 hover:scale-[1.03] hover:shadow-xl shadow-lg border border-foreground/10"
						>
							<Activity className="w-4 h-4" />
							Launch Live App
							<ArrowRight className="w-4 h-4" />
						</Link>
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
								table: ({ children }) => (
									<div className="my-6 md:my-12 overflow-x-auto shadow-2xl border border-foreground/10 p-1 bg-foreground/5 w-full">
										<table className="w-full border-collapse bg-background text-left border-hidden text-sm md:text-base">
											{children}
										</table>
									</div>
								),
								th: ({ children }) => (
									<th className="p-3 md:p-6 border border-foreground/10 bg-emerald-900 !text-white dark:bg-emerald-500 dark:!text-emerald-950 uppercase text-[9px] md:text-[10px] font-black tracking-widest text-left">
										{children}
									</th>
								),
								td: ({ children }) => (
									<td className="p-3 md:p-6 border border-foreground/10 text-xs md:text-sm lg:text-base font-light italic opacity-80 leading-relaxed">
										{children}
									</td>
								),
								code: ({ inline, className, children, ...props }: any) => {
									const match = /language-(\w+)/.exec(className || "");
									const lang = match ? match[1] : "";
									return !inline ? (
										<CopyCodeBlock
											language={lang}
											value={String(children).replace(/\n$/, "")}
											{...props}
										/>
									) : (
										<code
											className={`${className} px-1.5 py-0.5 rounded bg-foreground/10 text-accent font-semibold text-xs md:text-sm`}
											{...props}
										>
											{children}
										</code>
									);
								},
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
