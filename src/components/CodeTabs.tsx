import { useCallback, useSyncExternalStore } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeBlock {
	lang: string;
	label: string;
	code: string;
}

interface CodeTabsProps {
	blocks: CodeBlock[];
}

const STORAGE_KEY = "preferred-code-lang";
const DEFAULT_LANG = "python";

// External store for the language preference
const langStore = {
	subscribe(callback: () => void) {
		window.addEventListener("storage", callback);
		window.addEventListener("code-lang-change", callback);
		return () => {
			window.removeEventListener("storage", callback);
			window.removeEventListener("code-lang-change", callback);
		};
	},
	getSnapshot() {
		return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
	},
	setLang(lang: string) {
		localStorage.setItem(STORAGE_KEY, lang);
		// Dispatch event for other tabs and same-tab synchronization
		window.dispatchEvent(new Event("storage"));
		window.dispatchEvent(new CustomEvent("code-lang-change", { detail: lang }));
	},
};

export function CodeTabs({ blocks }: CodeTabsProps) {
	const activeLang = useSyncExternalStore(
		langStore.subscribe,
		langStore.getSnapshot,
	);

	const handleTabClick = useCallback((lang: string) => {
		langStore.setLang(lang);
	}, []);

	const activeBlock = blocks.find((b) => b.lang === activeLang) || blocks[0];

	return (
		<div className="p-1 bg-foreground/10 my-12 not-prose shadow-xl border border-foreground/5 overflow-hidden">
			<div className="flex bg-white border-b border-foreground/5">
				{blocks.map((block) => (
					<button
						key={block.lang}
						type="button"
						onClick={() => handleTabClick(block.lang)}
						className={`px-8 py-4 text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
							activeLang === block.lang
								? "bg-accent text-white"
								: "text-foreground/40 hover:text-foreground hover:bg-foreground/5"
						}`}
					>
						{block.label}
					</button>
				))}
			</div>
			<SyntaxHighlighter
				language={activeBlock.lang}
				style={oneLight}
				customStyle={{
					padding: "2rem",
					background: "#fff",
					fontSize: "0.9rem",
					margin: 0,
				}}
			>
				{activeBlock.code.trim()}
			</SyntaxHighlighter>
		</div>
	);
}
