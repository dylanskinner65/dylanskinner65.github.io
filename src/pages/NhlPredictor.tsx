import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { LiveNhlDashboard } from "../components/LiveNhlDashboard";

export function NhlPredictor() {
	return (
		<div className="space-y-12 pb-24 selection:bg-accent selection:text-white">
			{/* Page Header */}
			<header className="space-y-6 border-b border-foreground/5 pb-8">
				<div className="flex flex-wrap items-center gap-4 sm:gap-6 text-[10px] font-black text-accent uppercase tracking-[0.4em] italic">
					<span>APPLICATION</span>
					<span className="opacity-20">/</span>
					<span>LIVE TRACKING</span>
					<span className="opacity-20">/</span>
					<span className="flex items-center gap-1.5 bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full lowercase not-italic font-bold tracking-wider">
						<span className="relative flex h-1.5 w-1.5 shrink-0">
							<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
							<span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
						</span>
						pipeline online
					</span>
				</div>

				<div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
					<div className="space-y-4">
						<motion.h1
							initial={{ opacity: 0, y: 15 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
							style={{ fontVariationSettings: '"wght" 800' }}
							className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl italic tracking-tighter leading-[0.9] uppercase text-foreground"
						>
							NHL Live Predictor
						</motion.h1>
						<p className="text-base sm:text-lg md:text-xl text-foreground/50 italic font-light max-w-3xl leading-relaxed">
							A containerized, real-time NHL live win probability engine powered
							by rolling Bayesian Networks and XGBoost, running on a Raspberry
							Pi Homelab.
						</p>
					</div>

					{/* Quick CTA to write-up in header */}
					<Link
						to="/projects/nhl-predictor"
						className="shrink-0 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-accent hover:opacity-85 transition-opacity pb-2 border-b-2 border-accent/20 hover:border-accent"
					>
						<BookOpen className="w-3.5 h-3.5" />
						Read Architecture Write-up
					</Link>
				</div>
			</header>

			{/* Interactive Dashboard Container (Full Width) */}
			<section className="w-full">
				<LiveNhlDashboard />
			</section>

			{/* Footer CTA & Navigation Section */}
			<footer className="mt-20 pt-12 border-t border-foreground/10 flex flex-col md:flex-row justify-between items-stretch gap-8">
				{/* Back Link */}
				<Link
					to="/projects"
					className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-all self-center"
				>
					<ArrowLeft className="w-3.5 h-3.5" />
					Back to Projects
				</Link>

				{/* Beautiful Math/Write-up CTA Box */}
				<div className="flex-1 max-w-2xl bg-foreground/[0.02] dark:bg-foreground/[0.01] border border-foreground/5 hover:border-foreground/10 p-8 sm:p-10 rounded-none transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
					<div className="space-y-2">
						<span className="text-[8px] font-black text-accent uppercase tracking-widest">
							MATHEMATICS & ENGINEERING
						</span>
						<h3 className="text-lg sm:text-xl font-serif italic text-foreground leading-snug">
							How does the predictor compute live probabilities?
						</h3>
						<p className="text-xs text-foreground/60 leading-relaxed max-w-md">
							Explore the conditional dependencies, GroupKFold validation,
							carryover ratings, and the three primary modeling approaches
							(Bayesian Network, XGBoost, and MCMC game simulation).
						</p>
					</div>
					<Link
						to="/projects/nhl-predictor"
						className="shrink-0 inline-flex items-center gap-2 px-6 py-4 bg-foreground text-background font-black uppercase tracking-widest text-[9px] hover:scale-[1.02] transition-all hover:bg-accent hover:text-white"
					>
						Read Technical Write-Up
						<ArrowRight className="w-3.5 h-3.5" />
					</Link>
				</div>
			</footer>
		</div>
	);
}
