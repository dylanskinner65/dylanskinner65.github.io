import { type ReactNode, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

interface BlogPostLayoutProps {
	title: string;
	date: string;
	slug: string;
	category: string;
	excerpt: string;
	quote?: string;
	quoteAuthor?: string;
	children: ReactNode;
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
					style={{
						fontVariationSettings: `"wght" ${smoothWeight.get()}`,
						fontWeight: smoothWeight,
					}}
					className="text-5xl sm:text-7xl md:text-8xl lg:text-[10rem] italic tracking-tighter leading-[0.8] uppercase text-foreground"
				>
					{title}
				</motion.h1>
				<p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-foreground opacity-40 italic font-light max-w-3xl leading-relaxed">
					{excerpt}
				</p>
			</header>

			{quote && (
				<motion.div
					initial={{ opacity: 0, x: -20 }}
					whileInView={{ opacity: 1, x: 0 }}
					viewport={{ once: true }}
					className="p-8 sm:p-16 md:p-24 border-l-[8px] sm:border-l-[16px] md:border-l-[24px] border-accent bg-accent-soft italic text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-foreground tracking-tight leading-snug my-16 sm:my-24 md:my-32"
				>
					<blockquote>"{quote}"</blockquote>
					{quoteAuthor && (
						<cite className="block mt-8 sm:mt-12 text-[10px] font-black not-italic uppercase tracking-[0.5em] opacity-30">
							— {quoteAuthor.toUpperCase()}
						</cite>
					)}
				</motion.div>
			)}

			<div className="prose prose-xl sm:prose-2xl max-w-none text-foreground/80 leading-[1.8] space-y-8 sm:space-y-12 md:space-y-16 font-sans">
				{children}
			</div>

			<footer className="mt-48 pt-16 border-t-2 border-foreground/10 flex flex-col md:flex-row justify-between items-center gap-12">
				<motion.button
					type="button"
					whileHover={{ x: -10 }}
					onClick={() => navigate("/blog")}
					className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 hover:opacity-100 transition-all pb-2 border-b-2 border-transparent hover:border-accent flex items-center gap-4"
				>
					<span>←</span> Back to Blog
				</motion.button>
				<div className="flex gap-12 text-[10px] font-black uppercase tracking-[0.3em] opacity-20">
					{/* Removed redundant generic links */}
				</div>
			</footer>
		</article>
	);
}
