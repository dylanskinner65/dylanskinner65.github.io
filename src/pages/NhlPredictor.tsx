import { BlogPostLayout } from "../components/BlogPostLayout";
import { LiveNhlDashboard } from "../components/LiveNhlDashboard";

export function NhlPredictor() {
	return (
		<BlogPostLayout
			title="NHL Real-Time Live Win Predictor"
			date="25 May 2026"
			slug="nhl-predictor"
			category="Machine Learning & DevOps"
			excerpt="A containerized, real-time NHL live win probability engine running on a Raspberry Pi Homelab and visualised with an interactive scrubbing timeline."
			quote="Data is the new ice. It needs to be clean, smooth, and tracked at all times."
			quoteAuthor="Pi Zeya Analytics"
			backLink="/projects"
			backLabel="Back to Projects"
		>
			<div className="space-y-12">
				{/* Dynamic Real-time Visualizer Dashboard Component */}
				<section className="not-prose">
					<LiveNhlDashboard />
				</section>

				{/* Technical Write-up Section */}
				<article className="prose prose-invert max-w-none">
					<h2 className="text-4xl md:text-5xl mt-20 mb-8 italic border-b-2 border-foreground/5 pb-4 text-foreground">
						The Architecture & Engineering
					</h2>

					<p className="text-foreground/80 leading-relaxed pl-2 text-lg">
						This project represents a complete, production-grade refactoring of
						our sports analytics pipeline. By replacing 32 separate, overfit
						team-specific models with a single{" "}
						<strong>Unified Global XGBoost Model</strong>
						trained over{" "}
						<strong>1.3 million play-by-play rows (7,000+ games)</strong>, we
						resolved data sparsity and completely eliminated play-by-play row
						correlation data leakage through{" "}
						<strong>GroupKFold validation grouped by game ID</strong>.
					</p>

					<h3 className="text-3xl md:text-4xl mt-16 mb-6 italic text-foreground">
						FastAPI Raspberry Pi Homelab Server
					</h3>
					<p className="text-foreground/80 leading-relaxed pl-2">
						The machine learning model is served from a lightweight,
						containerized <strong>FastAPI server</strong> hosted on a local
						<strong>Raspberry Pi Homelab</strong>. To run this completely
						serverless and without ongoing hosting costs, the Pi acts as our
						CORS proxy and data processing node:
					</p>
					<ul className="list-disc list-outside space-y-2 my-8 ml-8">
						<li className="text-foreground/80 leading-relaxed pl-2 marker:text-accent marker:font-bold">
							<strong>Real-Time Schedule Fetching:</strong> The backend polls
							the NHL's internal web API to verify today's schedule, retrieving
							game times, logos, and live scores.
						</li>
						<li className="text-foreground/80 leading-relaxed pl-2 marker:text-accent marker:font-bold">
							<strong>Dynamic Event Aggregation:</strong> During active live
							games, the server downloads raw in-progress play-by-play JSONs,
							aggregates active game stats (shots, faceoffs, blocked shots,
							takeaways, penalties), and parses the <code>situationCode</code>{" "}
							to capture active power-play skater configurations.
						</li>
						<li className="text-foreground/80 leading-relaxed pl-2 marker:text-accent marker:font-bold">
							<strong>Sub-Millisecond Inference:</strong> The compiled XGBoost
							model computes live win probabilities in less than 1ms per event,
							running perfectly on ultra-low-power Raspberry Pi CPUs.
						</li>
					</ul>

					<h3 className="text-3xl md:text-4xl mt-16 mb-6 italic text-foreground">
						Offseason Carryover & Dynamic Priors
					</h3>
					<p className="text-foreground/80 leading-relaxed pl-2">
						To ensure the model handles year-to-year team quality shifts without
						overreacting to short-term variance (such as the Florida Panthers
						winning two Stanley Cups and then collapsing), the pipeline
						implements a <strong>dynamic rolling quality prior</strong>.
					</p>
					<p className="text-foreground/80 leading-relaxed pl-2">
						The server maintains a dynamic rating of each team's rolling win
						percentage and average goal differential over their past 10 games.
						Between seasons, the system applies the industry-standard{" "}
						<strong>70/30 carryover rule</strong> (retaining 70% of rating
						strength and reverting 30% to the league mean), allowing the prior
						to quickly converge to the team's true current strength within the
						first 10-15 games of the new season.
					</p>

					<h3 className="text-3xl md:text-4xl mt-16 mb-6 italic text-foreground">
						Interactive Visualisation Engineering
					</h3>
					<p className="text-foreground/80 leading-relaxed pl-2">
						The frontend dashboard is built using pure custom inline SVGs and{" "}
						<strong>Framer Motion transitions</strong>. Rather than relying on
						heavy, bloat-prone charting libraries, this bespoke layout maps
						time-series coordinates directly into coordinate space, allowing for
						exceptionally fluid, zero-latency timeline scrubbing and interactive
						synchronization between the scrollable event log and the win
						probability line.
					</p>
				</article>
			</div>
		</BlogPostLayout>
	);
}
