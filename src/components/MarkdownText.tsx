import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

interface MarkdownTextProps {
	content: string;
	className?: string;
	inline?: boolean;
}

/**
 * A component that renders text with support for Markdown and LaTeX.
 * Useful for titles, descriptions, and other short strings that need LaTeX support.
 */
export function MarkdownText({
	content,
	className = "",
	inline = true,
}: MarkdownTextProps) {
	const Component = inline ? "span" : "div";
	return (
		<Component className={className}>
			<ReactMarkdown
				remarkPlugins={[remarkMath]}
				rehypePlugins={[rehypeKatex]}
				components={{
					// If inline is true, we don't want the default <p> wrapper to break styling
					p: ({ children }) => (inline ? children : <p>{children}</p>),
				}}
			>
				{content}
			</ReactMarkdown>
		</Component>
	);
}
