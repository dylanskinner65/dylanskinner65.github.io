import { Link as RouterLink } from "react-router-dom";
import { MarkdownText } from "../components/MarkdownText";
import { getAllTalks } from "../hooks/useContent";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

export function Talks() {
	useDocumentMeta({
		title: "Talks | Dylan Skinner",
		description:
			"Talks by Dylan Skinner on agentic AI systems, machine learning, and MLOps.",
	});

	const sortedTalks = [...getAllTalks()].sort(
		(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
	);

	return (
		<div className="space-y-16 sm:space-y-24 md:space-y-32">
			<header className="border-b-2 border-foreground/5 pb-8 sm:pb-16">
				<h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl italic leading-none text-foreground tracking-tighter">
					Talks.
				</h1>
			</header>

			<div className="flex flex-col gap-px bg-foreground/10 border border-foreground/5 shadow-xl sm:shadow-2xl overflow-hidden">
				{sortedTalks.map((talk, i) => (
					<RouterLink
						key={talk.slug}
						to={`/talks/${talk.slug}`}
						className="bg-background p-8 sm:p-16 md:p-24 group hover:bg-accent-soft transition-all duration-500 block border-b border-foreground/5 last:border-0"
					>
						<div className="max-w-7xl mx-auto flex flex-col md:grid md:grid-cols-12 gap-6 md:gap-12 items-start md:items-center">
							<div className="md:col-span-3">
								<span className="text-[9px] sm:text-[10px] font-bold text-accent uppercase tracking-widest italic block mb-1 sm:mb-2">
									{talk.date.toUpperCase()}
								</span>
								{talk.venue && (
									<span className="text-[9px] sm:text-[10px] font-light italic opacity-50 block mb-1 sm:mb-2 text-foreground">
										{talk.venue}
									</span>
								)}
								<span className="text-[8px] sm:text-[9px] font-black opacity-20 uppercase tracking-[0.3em]">
									TALK_00{sortedTalks.length - i}
								</span>
							</div>
							<div className="md:col-span-7">
								<h2 className="text-2xl sm:text-4xl md:text-5xl italic md:group-hover:text-accent md:group-hover:translate-x-4 transition-all duration-500 text-foreground leading-tight">
									<MarkdownText content={talk.title} />
								</h2>
								<p className="text-base sm:text-lg md:text-xl font-light italic mt-4 sm:mt-6 line-clamp-2 text-foreground">
									<MarkdownText content={talk.description} />
								</p>
							</div>
							<div className="md:col-span-2 hidden md:flex justify-end">
								<div className="w-10 h-10 sm:w-12 sm:h-12 border border-foreground/10 rounded-full flex items-center justify-center group-hover:bg-accent group-hover:border-accent group-hover:text-white transition-all text-foreground">
									→
								</div>
							</div>
						</div>
					</RouterLink>
				))}
			</div>
		</div>
	);
}
