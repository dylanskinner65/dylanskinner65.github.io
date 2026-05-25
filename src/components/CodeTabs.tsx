import { useCallback, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
	oneDark,
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
	const [copied, setCopied] = useState(false);

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

	const handleCopy = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(activeBlock.code.trim());
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy text: ", err);
		}
	}, [activeBlock.code]);

	return (
		<div className="p-1 bg-foreground/10 my-12 not-prose shadow-xl border border-foreground/5 overflow-hidden rounded-lg">
			<div className="flex justify-between items-center bg-surface border-b border-foreground/5 transition-colors duration-300">
				<div className="flex overflow-x-auto scrollbar-none">
					{blocks.map((block) => (
						<button
							key={block.lang}
							type="button"
							onClick={() => handleTabClick(block.lang)}
							className={`px-6 sm:px-8 py-4 text-[10px] font-black uppercase tracking-widest transition-all duration-300 shrink-0 ${
								activeLang === block.lang
									? "bg-accent text-white"
									: "text-foreground opacity-40 hover:opacity-100 hover:bg-foreground/5"
							}`}
						>
							{block.label}
						</button>
					))}
				</div>
				<button
					type="button"
					onClick={handleCopy}
					className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground opacity-40 hover:opacity-100 hover:text-accent transition-all duration-300 cursor-pointer active:scale-95 shrink-0"
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
					language={activeBlock.lang}
					style={isDark ? oneDark : oneLight}
					customStyle={{
						padding: "1.5rem",
						background: "transparent",
						fontSize: "0.85rem",
						lineHeight: "1.7",
						margin: 0,
						overflowX: "auto",
						maxWidth: "100%",
					}}
				>
					{activeBlock.code.trim()}
				</SyntaxHighlighter>
			</div>
		</div>
	);
}
