import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
	atomDark,
	oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "../hooks/ThemeContext";

interface CodeBlock {
	lang: string;
	label: string;
	code: string;
}

interface CodeTabsProps {
	blocks: CodeBlock[];
}

const DEFAULT_LANG = "python";
const QUERY_PARAM = "lang";

export function CodeTabs({ blocks }: CodeTabsProps) {
	const [searchParams, setSearchParams] = useSearchParams();
	const { resolvedTheme } = useTheme();

	// 1. READ: Derive active language directly from URL during render
	const activeLang = searchParams.get(QUERY_PARAM) || DEFAULT_LANG;

	const handleTabClick = useCallback(
		(lang: string) => {
			// 2. UPDATE: Change the URL directly in the event handler
			setSearchParams(
				(prev) => {
					if (lang === DEFAULT_LANG) {
						prev.delete(QUERY_PARAM);
					} else {
						prev.set(QUERY_PARAM, lang);
					}
					return prev;
				},
				{ replace: true },
			);
		},
		[setSearchParams],
	);

	const activeBlock = blocks.find((b) => b.lang === activeLang) || blocks[0];
	const isDark = resolvedTheme === "dark";

	return (
		<div className="p-1 bg-foreground/10 my-12 not-prose shadow-xl border border-foreground/5 overflow-hidden">
			<div className="flex bg-surface border-b border-foreground/5 transition-colors duration-300">
				{blocks.map((block) => (
					<button
						key={block.lang}
						type="button"
						onClick={() => handleTabClick(block.lang)}
						className={`px-8 py-4 text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
							activeLang === block.lang
								? "bg-accent text-white"
								: "text-foreground opacity-40 hover:opacity-100 hover:bg-foreground/5"
						}`}
					>
						{block.label}
					</button>
				))}
			</div>
			<SyntaxHighlighter
				language={activeBlock.lang}
				style={isDark ? atomDark : oneLight}
				customStyle={{
					padding: "2rem",
					background: isDark ? "var(--background)" : "#fff",
					fontSize: "0.9rem",
					margin: 0,
					transition: "all 0.3s ease",
				}}
			>
				{activeBlock.code.trim()}
			</SyntaxHighlighter>
		</div>
	);
}
