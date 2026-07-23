import React, {
	type ReactNode,
	useCallback,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import { Link, useLocation } from "react-router-dom";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { visit } from "unist-util-visit";
import { useTheme } from "../hooks/ThemeContext";
import type { ContentMetadata } from "../hooks/useContent";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import {
	oneDark,
	oneLight,
	SyntaxHighlighter,
} from "../lib/syntaxHighlighting";
import { BlogPostLayout } from "./BlogPostLayout";
import { CodeTabs } from "./CodeTabs";

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
	return (tree: any) => {
		// Assigns each `code-tabs` directive a document-order search-param key
		// (lang, lang2, lang3, ...) so multiple tab groups on one page don't
		// share (and fight over) the same `?lang=` param. Stamped here, at
		// parse time, rather than via a React counter during render: parsing
		// runs once per content string with no double-invocation concerns
		// (unlike StrictMode-doubled render-phase state), so dev and prod
		// builds are guaranteed to agree on numbering.
		let codeTabsIndex = 0;

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
					if (node.name === "code-tabs") {
						data.hProperties.paramkey =
							codeTabsIndex === 0 ? "lang" : `lang${codeTabsIndex + 1}`;
						codeTabsIndex += 1;
					}
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

function parseFencedCodeChild(codeChild: React.ReactNode): {
	lang: string;
	value: string;
} | null {
	if (!React.isValidElement(codeChild)) return null;
	const { className = "", children } = codeChild.props as {
		className?: string;
		children?: React.ReactNode;
	};
	const match = /language-(\w+)/.exec(className);
	const lang = match ? match[1] : className.replace("language-", "") || "text";
	const value = String(children ?? "").replace(/\n$/, "");
	return { lang, value };
}

function langLabel(lang: string): string {
	if (lang === "python") return "Python";
	if (lang === "typescript" || lang === "javascript") return "TypeScript";
	return lang.toUpperCase();
}

/** Fenced blocks only — inline code is a bare `code` node without a `pre` parent. */
function MarkdownPre({ children }: { children?: React.ReactNode }) {
	const parsed = parseFencedCodeChild(children);
	if (!parsed) return <pre>{children}</pre>;
	return <CopyCodeBlock language={parsed.lang} value={parsed.value} />;
}

function isFencedPreElement(
	child: React.ReactNode,
): child is React.ReactElement {
	return (
		React.isValidElement(child) &&
		(child.type === "pre" || child.type === MarkdownPre)
	);
}

const markdownComponents = {
	"code-tabs": (({ children, paramkey }: any) => {
		const blocks = (Array.isArray(children) ? children : [children])
			.filter(isFencedPreElement)
			.map((pre) => {
				const parsed = parseFencedCodeChild(
					(pre as React.ReactElement<{ children?: React.ReactNode }>).props
						.children,
				);
				if (!parsed) return null;
				return {
					lang: parsed.lang,
					label: langLabel(parsed.lang),
					code: parsed.value,
				};
			})
			.filter((block): block is NonNullable<typeof block> => block !== null);
		return <CodeTabs blocks={blocks} paramKey={paramkey || "lang"} />;
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
			(child) => typeof child !== "string" || child.trim().length > 0,
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
		<ul className="list-disc list-outside space-y-2 my-8 ml-8">{children}</ul>
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
	pre: MarkdownPre,
	code: ({ className, children, ...props }: any) => (
		<code
			className={`${className} px-1.5 py-0.5 rounded bg-foreground/10 text-accent font-semibold text-xs md:text-sm`}
			{...props}
		>
			{children}
		</code>
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
} as Components;

interface MarkdownPageProps {
	item: ContentMetadata;
	/** Markdown body, or null while it is still being fetched. */
	content: string | null;
	/** True when the lazy body fetch failed; renders an error state instead. */
	contentError?: boolean;
	onRetryContent?: () => void;
	fallbackExcerpt: string;
	backLink?: string;
	backLabel?: string;
	beforeArticle?: ReactNode;
}

export function MarkdownPage({
	item,
	content,
	contentError = false,
	onRetryContent,
	fallbackExcerpt,
	backLink,
	backLabel,
	beforeArticle,
}: MarkdownPageProps) {
	useDocumentMeta({
		title: `${item.title} | Dylan Skinner`,
		description: item.description || fallbackExcerpt,
		type: "article",
	});

	const location = useLocation();
	const containerRef = useRef<HTMLDivElement>(null);

	useLayoutEffect(() => {
		if (!location.hash) {
			window.scrollTo(0, 0);
		}
	}, [location.hash]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: `content` is an intentional extra dependency — the hash target only exists in the DOM once the lazily-fetched markdown body has rendered, so scrolling must be retried when it arrives.
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
	}, [location.hash, content]);

	return (
		<div ref={containerRef}>
			<BlogPostLayout
				title={item.title}
				date={item.date}
				slug={item.slug}
				category={item.category}
				excerpt={item.description || fallbackExcerpt}
				quote={item.quote}
				quoteAuthor={item.quoteAuthor}
				backLink={backLink}
				backLabel={backLabel}
			>
				{beforeArticle}
				{contentError && (
					<div className="not-prose p-8 border border-red-500/20 bg-red-500/10 rounded-lg space-y-4">
						<p className="italic font-light text-red-700 dark:text-red-200">
							This article failed to load. Check your connection and try again.
						</p>
						<button
							type="button"
							onClick={onRetryContent}
							className="text-[10px] font-black uppercase tracking-widest border-b-2 border-accent hover:text-accent transition-colors pb-1 text-foreground"
						>
							Try Again
						</button>
					</div>
				)}
				{content !== null && (
					<article className="prose prose-invert max-w-none">
						<ReactMarkdown
							remarkPlugins={[
								remarkGfm,
								remarkMath,
								remarkDirective,
								remarkDirectiveTransformer,
							]}
							rehypePlugins={[rehypeRaw, rehypeKatex]}
							components={markdownComponents}
						>
							{content}
						</ReactMarkdown>
					</article>
				)}
			</BlogPostLayout>
		</div>
	);
}
