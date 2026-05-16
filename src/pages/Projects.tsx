import { useLayoutEffect } from "react";
import {
	Link as RouterLink,
	useLocation,
	useSearchParams,
} from "react-router-dom";
import { MarkdownText } from "../components/MarkdownText";
import { getAllProjects } from "../hooks/useContent";

export function Projects() {
	const location = useLocation();
	const [searchParams, setSearchParams] = useSearchParams();
	const itemsPerPage = 6;

	// Use the new dynamic loader
	const allProjects = getAllProjects();

	const sortedProjects = [...allProjects].sort(
		(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
	);

	// Get current page from URL, defaulting to 1
	const currentPage = Number.parseInt(searchParams.get("page") || "1", 10);
	const totalPages = Math.ceil(sortedProjects.length / itemsPerPage);

	// Handle scrolling to the project when returning via hash
	useLayoutEffect(() => {
		const hash = location.hash.replace("#", "");
		if (hash) {
			const element = document.getElementById(hash);
			if (element) {
				element.scrollIntoView({ behavior: "smooth", block: "center" });
			}
		} else if (!searchParams.has("page")) {
			// Only scroll to top if we're on the "main" projects page with no specific target
			window.scrollTo(0, 0);
		}
	}, [location.hash, searchParams]);

	const indexOfLastItem = currentPage * itemsPerPage;
	const indexOfFirstItem = indexOfLastItem - itemsPerPage;
	const currentProjects = sortedProjects.slice(
		indexOfFirstItem,
		indexOfLastItem,
	);

	const handlePageChange = (newPage: number) => {
		setSearchParams({ page: newPage.toString() });
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	return (
		<div className="space-y-16 sm:space-y-24 md:space-y-32">
			<header className="border-b-2 border-foreground/5 pb-8 sm:pb-16">
				<h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl italic leading-none text-foreground tracking-tighter">
					Projects.
				</h1>
			</header>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-foreground/10 border border-foreground/5 shadow-xl sm:shadow-2xl overflow-hidden">
				{currentProjects.map((project, i) => (
					<RouterLink
						key={project.slug}
						id={project.slug}
						// Include the current page in the query so we can construct a return link
						to={`/projects/${project.slug}?fromPage=${currentPage}`}
						className="bg-background p-8 sm:p-12 md:p-16 group hover:bg-accent-soft transition-all duration-500 block border-b md:border-b-0 border-foreground/5"
					>
						<div className="space-y-6">
							<div className="flex justify-between items-start">
								<div className="space-y-1">
									<span className="text-[9px] font-bold text-accent uppercase tracking-widest italic block">
										{project.category.toUpperCase()}
									</span>
									<span className="text-[8px] font-black opacity-20 uppercase tracking-[0.3em]">
										PROJ_00{sortedProjects.length - indexOfFirstItem - i}
									</span>
								</div>
								<div className="w-8 h-8 border border-foreground/10 rounded-full flex items-center justify-center group-hover:bg-accent group-hover:border-accent group-hover:text-white transition-all text-foreground">
									→
								</div>
							</div>
							<h2 className="text-2xl sm:text-3xl md:text-4xl italic md:group-hover:text-accent md:group-hover:translate-x-2 transition-all duration-500 text-foreground leading-tight">
								<MarkdownText content={project.title} />
							</h2>
							<p className="text-base sm:text-lg font-light italic text-foreground opacity-60 line-clamp-3">
								<MarkdownText content={project.description} />
							</p>
						</div>
					</RouterLink>
				))}
			</div>

			{totalPages > 1 && (
				<div className="flex flex-col sm:grid sm:grid-cols-12 bg-background border border-foreground/10 shadow-xl overflow-hidden">
					<button
						type="button"
						onClick={() => handlePageChange(currentPage - 1)}
						disabled={currentPage === 1}
						className="sm:col-span-4 p-8 sm:p-12 border-b sm:border-b-0 sm:border-r border-foreground/10 text-left transition-all group disabled:opacity-5"
					>
						<span className="text-[9px] font-black uppercase tracking-widest opacity-40 block mb-1">
							Back
						</span>
						<span className="text-lg sm:text-xl font-serif italic text-foreground group-hover:text-accent transition-colors">
							Previous Page
						</span>
					</button>

					<div className="sm:col-span-4 p-8 sm:p-12 flex items-center justify-center text-xs md:text-sm font-black opacity-20 tracking-[0.3em] text-foreground border-b sm:border-b-0 border-foreground/10">
						{currentPage.toString().padStart(2, "0")} /{" "}
						{totalPages.toString().padStart(2, "0")}
					</div>

					<button
						type="button"
						onClick={() => handlePageChange(currentPage + 1)}
						disabled={currentPage === totalPages}
						className="sm:col-span-4 p-8 sm:p-12 text-right transition-all group disabled:opacity-5 hover:bg-foreground hover:text-background"
					>
						<span className="text-[9px] font-black uppercase tracking-widest opacity-40 group-hover:text-accent block mb-1">
							Continue
						</span>
						<span className="text-lg sm:text-xl font-serif italic group-hover:text-current">
							Next Page →
						</span>
					</button>
				</div>
			)}
		</div>
	);
}
