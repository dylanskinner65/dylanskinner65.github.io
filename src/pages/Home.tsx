import { motion } from "framer-motion";
import { Link as RouterLink } from "react-router-dom";
import { GenerativeTopology } from "../components/GenerativeTopology";
import { Magnetic } from "../components/Magnetic";
import { MarkdownText } from "../components/MarkdownText";
import { getAllPosts } from "../hooks/useContent";

export function Home() {
	const latestPosts = [...getAllPosts()]
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
		.slice(0, 3);

	const featured = latestPosts[0];
	const others = latestPosts.slice(1);

	const springConfig = { stiffness: 300, damping: 20 };

	const experience = [
		{
			company: "SchoolAI",
			role: "AI Engineer",
			date: "2025 — Present",
			desc: (
				<div className="space-y-6">
					<p className="text-2xl font-light italic leading-relaxed opacity-70 max-w-3xl text-foreground text-pretty">
						Architecting a platform serving{" "}
						<span className="text-accent font-medium italic">
							3B tokens/day
						</span>
						. Slashed LLM costs by{" "}
						<span className="text-accent font-medium italic">$8k/day</span>{" "}
						through vendor optimization and prompt caching. Built a custom
						internal Agent SDK and migrated core product workflows to agentic
						architectures.
					</p>
					<div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-black uppercase tracking-widest opacity-60">
						<span>Agent SDK</span>
						<span>Agentic Workflows</span>
						<span>LLM Infrastructure</span>
						<span>Vendor Strategy</span>
						<span>Cost Optimization</span>
					</div>
				</div>
			),
		},
		{
			company: "e-TeleQuote",
			role: "Data Scientist",
			date: "2024 — 2025",
			desc: (
				<>
					Worked closely with financial planning and sales teams to obtain
					data-driven insights. Models included{" "}
					<span className="text-accent font-medium italic">
						bayesian hierarchical models
					</span>
					, CatBoost, and gamma-poisson architectures.
				</>
			),
		},
		{
			company: "BYU Research",
			role: "Mathematics Research Assistant",
			date: "2021 — 2024",
			desc: (
				<div className="space-y-4 text-foreground/70 text-pretty">
					<p>
						Research assistant for{" "}
						<a
							href="https://science.byu.edu/directory/mark-hughes"
							target="_blank"
							className="text-accent underline underline-offset-4"
							rel="noreferrer"
						>
							Dr. Mark Hughes
						</a>
						. Applied deep reinforcement learning (PPO) to 4D topology.
						Presented at JMM Boston/SF and published an honors thesis.
					</p>
					<div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-black uppercase tracking-widest opacity-60">
						<a
							href="/BostonPresentation.pdf"
							target="_blank"
							className="hover:text-accent transition-colors underline decoration-2 underline-offset-4"
							rel="noreferrer"
						>
							JMM Boston
						</a>
						<a
							href="/San Francisco Presentation.pdf"
							target="_blank"
							className="hover:text-accent transition-colors underline decoration-2 underline-offset-4"
							rel="noreferrer"
						>
							JMM San Fran
						</a>
						<a
							href="/mlops_talk.pdf"
							target="_blank"
							className="hover:text-accent transition-colors underline decoration-2 underline-offset-4"
							rel="noreferrer"
						>
							MLOps Talk
						</a>
						<a
							href="/Using Deep Learning Techniques to Find the 4D Slice Genus of a Kn.pdf"
							target="_blank"
							className="hover:text-accent transition-colors underline decoration-2 underline-offset-4"
							rel="noreferrer"
						>
							Honors Thesis
						</a>
					</div>
				</div>
			),
		},
		{
			company: "Harbor Health",
			role: "Data Science Intern",
			date: "2023",
			desc: "Developed time series forecasting and LLM-based data matching systems for healthcare optimization.",
		},
		{
			company: "BYU TA",
			role: "R Programming Teaching Assistant",
			date: "2022",
			desc: "Instructed students in statistical modeling and tidyverse-based visualization in R.",
		},
	];

	// GPU-Accelerated Page-Load Mount Entrance Variations
	const fadeInUp = {
		initial: { opacity: 0, y: 30 },
		animate: { opacity: 1, y: 0 },
		transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
	};

	const bioSpring = {
		initial: { opacity: 0, x: -30 },
		animate: { opacity: 1, x: 0 },
		transition: { type: "spring", stiffness: 90, damping: 20, delay: 0.25 },
	};

	const photoSpring = {
		initial: { opacity: 0, scale: 0.96 },
		animate: { opacity: 1, scale: 1 },
		transition: { type: "spring", stiffness: 70, damping: 22, delay: 0.35 },
	};

	return (
		<div className="space-y-16 sm:space-y-24 md:space-y-32">
			{/* Animated Hero Section */}
			<section className="relative -mt-4 sm:-mt-8 md:-mt-12 overflow-hidden py-16 sm:py-24 md:py-32">
				{/* Generative 4D Topology Backdrop */}
				<GenerativeTopology />

				<div className="max-w-7xl w-full mx-auto relative z-10 space-y-12 sm:space-y-16">
					{/* Top Grid: Split Row for Name & Face */}
					<div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 md:gap-12 items-start relative pt-4 md:pt-4">
						<div className="lg:col-span-8 relative w-full space-y-6 sm:space-y-8">
							<motion.div
								variants={fadeInUp}
								initial="initial"
								animate="animate"
								className="origin-left z-30 relative"
							>
								<h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[10rem] leading-none italic tracking-tighter text-foreground text-pretty pb-2 sm:pb-4">
									Dylan Skinner
								</h1>
							</motion.div>

							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{
									duration: 0.8,
									delay: 0.1,
									ease: [0.16, 1, 0.3, 1],
								}}
								className="space-y-4 sm:space-y-6"
							>
								<h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl italic opacity-40 font-light text-foreground text-pretty">
									AI Engineer. Researcher.
								</h2>
								<p className="text-base sm:text-lg md:text-xl lg:text-2xl font-light italic leading-relaxed opacity-60 max-w-2xl text-foreground text-pretty">
									Technical explorations into high-fidelity AI agents and
									four-dimensional topological manifold analysis.
								</p>
							</motion.div>
						</div>

						<div className="lg:col-span-4 w-full mt-8 lg:mt-0">
							<motion.div
								variants={photoSpring}
								initial="initial"
								animate="animate"
								className="relative group z-10 max-w-sm mx-auto lg:max-w-none"
							>
								<div className="absolute -inset-4 border border-emerald-900/5 transition-colors group-hover:border-accent/20"></div>
								<img
									src="/me.png"
									alt="Dylan Skinner"
									className="w-full aspect-[3/4] object-cover border-4 border-white shadow-xl sm:shadow-2xl transition-all duration-700"
								/>
							</motion.div>
						</div>
					</div>

					{/* Bottom Grid: Full Width Bio Box */}
					<motion.div
						variants={bioSpring}
						initial="initial"
						animate="animate"
						className="w-full z-20"
					>
						<div className="p-8 sm:p-16 md:p-24 border border-foreground/5 bg-background shadow-[0_20px_50px_rgba(0,0,0,0.05)] lg:shadow-[0_40px_100px_rgba(0,0,0,0.1)]">
							<p className="text-lg sm:text-xl md:text-2xl lg:text-3xl italic font-light leading-relaxed opacity-80 text-foreground text-pretty">
								I am an{" "}
								<span className="text-accent font-medium italic underline underline-offset-8 decoration-1">
									AI Engineer
								</span>{" "}
								currently pursuing my Master's at Georgia Tech. I focus on
								autonomous workflows and the geometric foundations of deep
								reinforcement learning.
							</p>
							<div className="mt-8 sm:mt-12 md:mt-16 flex items-center gap-8 sm:gap-12">
								<Magnetic strength={0.2}>
									<RouterLink
										to="/blog"
										className="inline-block px-8 py-4 sm:px-12 sm:py-6 bg-foreground text-background font-black uppercase tracking-widest text-[9px] sm:text-[10px] hover:scale-105 transition-all shadow-lg sm:shadow-xl text-center active:scale-95"
									>
										Explore Research Blog
									</RouterLink>
								</Magnetic>
							</div>
						</div>
					</motion.div>
				</div>
			</section>

			{/* Executive Ledger */}
			<section
				id="experience"
				className="relative z-40 lg:-mt-24 mt-0 drafting-marker drafting-marker-tr drafting-marker-bl"
			>
				<div className="flex items-baseline justify-between mb-8 sm:mb-16 border-b-2 border-foreground/5 pb-4 sm:pb-8 relative">
					{/* Massive Watermark Numeral */}
					<span className="absolute -top-12 -left-6 text-[8rem] sm:text-[12rem] md:text-[16rem] font-sans font-black opacity-[0.02] dark:opacity-[0.01] select-none pointer-events-none">
						01
					</span>
					<h2 className="text-4xl sm:text-5xl md:text-7xl font-serif italic leading-none text-foreground relative z-10">
						Experience
					</h2>
				</div>

				<div className="grid gap-px bg-foreground/10 border border-foreground/5 shadow-xl sm:shadow-2xl overflow-hidden">
					{experience.map((exp, i) => (
						<motion.div
							key={exp.company}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ delay: i * 0.1, ...springConfig }}
							className="bg-background p-8 sm:p-16 md:p-24 flex flex-col md:grid md:grid-cols-12 gap-6 sm:gap-8 hover:bg-accent-soft transition-colors group border-b border-foreground/5 last:border-0"
						>
							<div className="md:col-span-3">
								<span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-accent italic opacity-60">
									{exp.date}
								</span>
								<h3 className="mt-1 sm:mt-2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl italic leading-none text-foreground">
									{exp.company}
								</h3>
							</div>
							<div className="md:col-span-9">
								<span className="text-[10px] sm:text-xs font-black uppercase tracking-widest opacity-40 block mb-2 sm:mb-4 text-foreground">
									{exp.role}
								</span>
								<div className="text-base sm:text-lg md:text-xl lg:text-2xl font-light italic leading-relaxed opacity-70 max-w-3xl text-foreground text-pretty">
									{exp.desc}
								</div>
							</div>
						</motion.div>
					))}
				</div>
			</section>

			{/* Featured Blog */}
			<section
				id="blog"
				className="pb-16 sm:pb-32 drafting-marker drafting-marker-tr drafting-marker-bl"
			>
				<div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-12 sm:mb-24 border-b-2 border-foreground/5 pb-4 sm:pb-8 gap-4 relative">
					{/* Massive Watermark Numeral */}
					<span className="absolute -top-12 -left-6 text-[8rem] sm:text-[12rem] md:text-[16rem] font-sans font-black opacity-[0.02] dark:opacity-[0.01] select-none pointer-events-none">
						02
					</span>
					<h2 className="text-4xl sm:text-5xl md:text-7xl font-serif italic leading-none text-foreground text-pretty relative z-10">
						My Blog.
					</h2>
					<RouterLink
						to="/blog"
						className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] hover:text-accent opacity-40 hover:opacity-100 transition-all text-foreground text-pretty z-10"
					>
						View All Entries →
					</RouterLink>
				</div>

				<div className="flex flex-col lg:grid lg:grid-cols-12 gap-px bg-foreground/10 border border-foreground/5 shadow-xl sm:shadow-2xl overflow-hidden">
					<motion.div
						transition={springConfig}
						className="lg:col-span-7 bg-background p-8 sm:p-16 md:p-24 flex flex-col justify-between gap-12 sm:gap-16"
					>
						<div>
							<span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-accent mb-4 sm:mb-6 block italic">
								{featured.date.toUpperCase()}
							</span>
							<h3 className="text-4xl sm:text-5xl md:text-7xl italic leading-[0.9] mb-6 sm:mb-8 text-foreground text-pretty">
								<MarkdownText content={featured.title} />
							</h3>
							<p className="text-base sm:text-lg md:text-xl lg:text-2xl font-light italic opacity-60 leading-relaxed line-clamp-3 text-pretty text-foreground">
								<MarkdownText content={featured.description} />
							</p>
						</div>
						<Magnetic strength={0.1}>
							<RouterLink
								to={`/blog/${featured.slug}`}
								className="text-[10px] sm:text-xs font-black uppercase tracking-widest border-b-2 border-accent self-start hover:text-accent transition-colors pb-1 text-foreground"
							>
								Read Full Entry
							</RouterLink>
						</Magnetic>
					</motion.div>

					<div className="lg:col-span-5 flex flex-col gap-px">
						{others.map((post) => (
							<RouterLink
								key={post.slug}
								to={`/blog/${post.slug}`}
								className="bg-background p-8 sm:p-12 flex-1 flex flex-col justify-between group hover:bg-accent-soft transition-colors"
							>
								<div>
									<span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-accent mb-2 sm:mb-4 block italic">
										{post.date.toUpperCase()}
									</span>
									<h4 className="text-2xl sm:text-3xl md:text-4xl italic group-hover:text-accent transition-colors mb-2 sm:mb-4 text-foreground text-pretty">
										<MarkdownText content={post.title} />
									</h4>
									<p className="text-sm sm:text-base font-light italic opacity-50 line-clamp-2 text-foreground text-pretty">
										<MarkdownText content={post.description} />
									</p>
								</div>
								<span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-accent mt-6 sm:mt-8 opacity-0 group-hover:opacity-100 transition-all">
									Open Blog →
								</span>
							</RouterLink>
						))}
					</div>
				</div>
			</section>
		</div>
	);
}
