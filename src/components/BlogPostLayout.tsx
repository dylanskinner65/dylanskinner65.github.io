import {
	motion,
	useMotionTemplate,
	useScroll,
	useSpring,
	useTransform,
} from "framer-motion";
import { type ReactNode, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MarkdownText } from "./MarkdownText";

interface BlogPostLayoutProps {
	title: string;
	date: string;
	slug: string;
	category: string;
	excerpt: string;
	quote?: string;
	quoteAuthor?: string;
	children: ReactNode;
	backLink?: string;
	backLabel?: string;
}

export function BlogPostLayout({
	title,
	date,
	slug,
	category,
	excerpt,
	quote,
	quoteAuthor,
	children,
	backLink = "/blog",
	backLabel = "Back to Blog",
}: BlogPostLayoutProps) {
	const navigate = useNavigate();
	const containerRef = useRef<HTMLElement>(null);

	const { scrollYProgress } = useScroll({
		target: containerRef,
		offset: ["start start", "end end"],
	});

	// Header weight transitions from 400 to 900 as you scroll
	const headerWeight = useTransform(scrollYProgress, [0, 0.2], [400, 900]);
	const smoothWeight = useSpring(headerWeight, { stiffness: 100, damping: 30 });
	const fontVariationSettings = useMotionTemplate`"wght" ${smoothWeight}`;

	return (
		<article
			ref={containerRef}
			className="max-w-4xl mx-auto space-y-16 sm:space-y-24 md:space-y-32 pb-24 sm:pb-32 md:pb-48 selection:bg-accent selection:text-white px-8 sm:px-16 md:px-0"
		>
			<header className="space-y-8 sm:space-y-12">
				<div className="flex flex-wrap items-center gap-4 sm:gap-6 text-[10px] font-black text-accent uppercase tracking-[0.4em] italic">
					<time>{date.toUpperCase()}</time>
					<span className="opacity-20">/</span>
					<span>{slug.toUpperCase()}</span>
					<span className="opacity-20">/</span>
					<span>{category.toUpperCase()}</span>
				</div>
				<motion.h1
					style={{ fontVariationSettings }}
					className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl italic tracking-tighter leading-[0.85] uppercase text-foreground"
				>
					<MarkdownText content={title} />
				</motion.h1>
				<div className="text-base sm:text-lg md:text-xl lg:text-2xl text-foreground opacity-40 italic font-light max-w-3xl leading-relaxed">
					<MarkdownText content={excerpt} />
				</div>
			</header>

			{quote && (
				<motion.div
					initial={{ opacity: 0, x: -20 }}
					whileInView={{ opacity: 1, x: 0 }}
					viewport={{ once: true }}
					className="p-8 sm:p-12 md:p-16 border-l-4 sm:border-l-8 md:border-l-[12px] border-accent bg-accent-soft italic text-xl sm:text-2xl md:text-3xl text-foreground tracking-tight leading-snug my-12 sm:my-16 md:my-20"
				>
					<blockquote>"{quote}"</blockquote>
					{quoteAuthor && (
						<cite className="block mt-4 sm:mt-6 text-[10px] font-black not-italic uppercase tracking-[0.5em] opacity-30">
							— {quoteAuthor.toUpperCase()}
						</cite>
					)}
				</motion.div>
			)}

			<div className="prose max-w-none text-foreground/80 leading-[1.8] space-y-6 sm:space-y-8 md:space-y-12 font-sans">
				{children}
			</div>

			<footer className="mt-48 pt-16 border-t-2 border-foreground/10 flex flex-col md:flex-row justify-between items-center gap-12">
				<motion.button
					type="button"
					whileHover={{ x: -10 }}
					onClick={() => navigate(backLink)}
					className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 hover:opacity-100 transition-all pb-2 border-b-2 border-transparent hover:border-accent flex items-center gap-4"
				>
					<span>←</span> {backLabel}
				</motion.button>
				<div className="flex gap-12 text-[10px] font-black uppercase tracking-[0.3em] opacity-20">
					{/* Removed redundant generic links */}
				</div>
			</footer>
		</article>
	);
}
