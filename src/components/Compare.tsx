import { useTheme } from "../hooks/ThemeContext";
import {
	oneDark,
	oneLight,
	SyntaxHighlighter,
} from "../lib/syntaxHighlighting";

export type CompareTone = "bad" | "good" | "neutral";
export type CompareKind = "code" | "list";

export interface CompareSide {
	label: string;
	tone: CompareTone;
	kind?: CompareKind;
	lang: string;
	code: string;
}

const TONE_CLASSES: Record<
	CompareTone,
	{ panel: string; label: string; marker: string }
> = {
	bad: {
		panel: "bg-red-500/5 dark:bg-red-500/10 border-red-500/10",
		label: "text-red-800 dark:text-red-400 border-red-500/10",
		marker: "before:content-['−'] before:text-red-600 dark:before:text-red-400",
	},
	good: {
		panel: "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/10",
		label: "text-emerald-800 dark:text-emerald-400 border-emerald-500/10",
		marker:
			"before:content-['+'] before:text-emerald-600 dark:before:text-emerald-400",
	},
	neutral: {
		panel: "bg-foreground/5 border-foreground/10",
		label: "text-foreground/70 border-foreground/10",
		marker: "before:content-['•'] before:text-foreground/50",
	},
};

function CompareList({ code, tone }: { code: string; tone: CompareTone }) {
	const items = code
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean);
	const toneClasses = TONE_CLASSES[tone];

	return (
		<ul className="pl-0 m-0 space-y-2 p-4" style={{ listStyleType: "none" }}>
			{items.map((item) => (
				<li
					key={item}
					className={`text-xs font-light opacity-90 pl-5 relative before:absolute before:left-0 before:font-bold ${toneClasses.marker}`}
					style={{ listStyleType: "none" }}
				>
					{item}
				</li>
			))}
		</ul>
	);
}

function ComparePanel({ label, tone, kind = "code", lang, code }: CompareSide) {
	const { resolvedTheme } = useTheme();
	const toneClasses = TONE_CLASSES[tone];

	return (
		<div
			className={`rounded-lg border shadow-xl overflow-hidden ${toneClasses.panel}`}
		>
			<span
				className={`text-[10px] font-black tracking-widest uppercase block px-4 py-3 border-b ${toneClasses.label}`}
			>
				{label}
			</span>
			{kind === "list" ? (
				<CompareList code={code} tone={tone} />
			) : (
				<div className="w-full overflow-hidden">
					<SyntaxHighlighter
						language={lang}
						style={resolvedTheme === "dark" ? oneDark : oneLight}
						customStyle={{
							padding: "1rem",
							background: "transparent",
							margin: 0,
							fontSize: "0.75rem",
							lineHeight: "1.7",
							overflowX: "auto",
							maxWidth: "100%",
						}}
					>
						{code}
					</SyntaxHighlighter>
				</div>
			)}
		</div>
	);
}

export function Compare({
	left,
	right,
}: {
	left: CompareSide;
	right: CompareSide;
}) {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-12 not-prose">
			<ComparePanel {...left} />
			<ComparePanel {...right} />
		</div>
	);
}
