import { Activity, ArrowRight } from "lucide-react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { MarkdownPage } from "../components/MarkdownPage";
import { getProjectBySlug } from "../hooks/useContent";

function NhlPredictorCta() {
	return (
		<div className="mb-16 not-prose p-8 sm:p-12 border-2 border-accent/20 bg-accent-soft backdrop-blur-md rounded-none relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-8 shadow-2xl group">
			{/* Ambient accent background glow */}
			<div className="absolute -right-24 -top-24 w-48 h-48 rounded-full bg-accent/10 blur-3xl pointer-events-none group-hover:scale-150 transition-transform duration-700"></div>

			<div className="space-y-4 relative z-10">
				<div className="flex items-center gap-3">
					<span className="text-[9px] font-black text-accent uppercase tracking-widest bg-accent/10 border border-accent/25 px-3 py-1 rounded-none flex items-center gap-1.5">
						<span className="relative flex h-1.5 w-1.5 shrink-0">
							<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
							<span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent"></span>
						</span>
						Interactive Live Dashboard
					</span>
					<span className="text-[9px] font-bold text-foreground/40 uppercase tracking-widest italic">
						Active homelab container
					</span>
				</div>

				<h3 className="text-2xl sm:text-3xl md:text-4xl italic text-foreground tracking-tight leading-none uppercase font-black">
					Real-Time Win Predictor
				</h3>

				<p className="text-sm sm:text-base text-foreground/75 italic font-light max-w-2xl leading-relaxed">
					A live tracker performing sub-millisecond dynamic XGBoost & rolling
					Bayesian calculations. View live schedule, event scrubbing logs, and
					real-time win probability curves.
				</p>
			</div>

			<Link
				to="/live-nhl"
				className="relative z-10 shrink-0 inline-flex items-center gap-3 px-8 py-5 bg-foreground text-background hover:bg-accent hover:text-white font-black uppercase tracking-widest text-[10px] sm:text-xs transition-all duration-300 hover:scale-[1.03] hover:shadow-xl shadow-lg border border-foreground/10"
			>
				<Activity className="w-4 h-4" />
				Launch Live App
				<ArrowRight className="w-4 h-4" />
			</Link>
		</div>
	);
}

export function DynamicProject() {
	const { slug } = useParams();
	const [searchParams] = useSearchParams();
	const project = slug ? getProjectBySlug(slug) : undefined;

	const fromPage = searchParams.get("fromPage") || "1";

	if (!project) {
		return <Navigate to="/projects" replace />;
	}

	return (
		<MarkdownPage
			item={project}
			fallbackExcerpt="Project exploration."
			backLink={`/projects?page=${fromPage}#${project.slug}`}
			backLabel="Back to Projects"
			beforeArticle={project.slug === "nhl-predictor" && <NhlPredictorCta />}
		/>
	);
}
