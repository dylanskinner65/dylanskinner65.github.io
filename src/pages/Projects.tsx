import { motion } from "framer-motion";
import { Link as RouterLink } from "react-router-dom";
import { Magnetic } from "../components/Magnetic";
import contentData from "../data/content.json";

export function Projects() {
	const springConfig = { stiffness: 300, damping: 20 };

	return (
		<div className="space-y-16 sm:space-y-24 md:space-y-32">
			<header className="max-w-4xl space-y-4 sm:space-y-8 border-b-2 border-foreground/5 pb-8 sm:pb-16 text-foreground">
				<h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[10rem] italic leading-none tracking-tighter">
					Projects.
				</h1>
				<p className="text-lg sm:text-xl md:text-2xl lg:text-3xl opacity-40 font-light italic leading-relaxed text-pretty">
					Computational experiments in topology, predictive modeling, and
					machine learning research.
				</p>
			</header>

			<div className="grid sm:grid-cols-2 gap-6 sm:gap-12">
				{contentData.projects
					.sort(
						(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
					)
					.map((project, i) => {
						return (
							<motion.div
								key={project.slug}
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ delay: i * 0.1, ...springConfig }}
								whileHover={{ y: -10 }}
							>
								<RouterLink
									to={`/projects/${project.slug}`}
									className="bg-background border border-foreground/5 p-8 sm:p-16 md:p-24 shadow-xl hover:shadow-2xl transition-all group flex flex-col justify-between min-h-[400px] sm:h-[500px] relative overflow-hidden"
								>
									<div>
										<div className="flex justify-between items-start mb-6 sm:mb-8">
											<span className="text-[9px] sm:text-[10px] font-black text-accent italic uppercase tracking-[0.2em] sm:tracking-[0.3em]">
												{project.field || "Research"} {/* // */}{" "}
												{project.date.split("-")[0]}
											</span>
											<span className="text-[8px] sm:text-[9px] font-bold opacity-20 uppercase tracking-widest">
												PROJ_0{contentData.projects.length - i}
											</span>
										</div>
										<h2 className="text-4xl sm:text-5xl md:text-7xl italic leading-[0.85] tracking-tighter mb-6 sm:mb-8 md:group-hover:translate-x-4 transition-all duration-500 text-foreground text-pretty">
											{project.title}
										</h2>
										<p className="text-base sm:text-lg md:text-xl lg:text-2xl opacity-40 font-light italic leading-relaxed line-clamp-4 sm:line-clamp-3 text-foreground text-pretty">
											{project.description}
										</p>
									</div>

									<div className="pt-6 sm:pt-8 border-t border-foreground/5 flex flex-col sm:flex-row justify-between items-start sm:items-center mt-auto gap-4">
										<div className="flex flex-wrap gap-2 sm:gap-3">
											{project.tags.slice(0, 3).map((tag) => (
												<span
													key={tag}
													className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest opacity-30 group-hover:opacity-100 transition-all text-foreground"
												>
													{tag}
												</span>
											))}
										</div>
										<Magnetic strength={0.2}>
											<span className="text-accent font-bold italic md:group-hover:translate-x-2 transition-transform text-[10px] sm:text-xs">
												View_Research →
											</span>
										</Magnetic>
									</div>
								</RouterLink>
							</motion.div>
						);
					})}
			</div>
		</div>
	);
}
