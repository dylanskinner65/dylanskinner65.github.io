import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { MarkdownText } from "../components/MarkdownText";
import { getAllPosts } from "../hooks/useContent";

export function Blog() {
	const [currentPage, setCurrentPage] = useState(1);
	const postsPerPage = 10;

	// Use the new dynamic loader instead of the JSON file
	const allPosts = getAllPosts();

	const sortedPosts = [...allPosts].sort(
		(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
	);

	const indexOfLastPost = currentPage * postsPerPage;
	const indexOfFirstPost = indexOfLastPost - postsPerPage;
	const currentPosts = sortedPosts.slice(indexOfFirstPost, indexOfLastPost);
	const totalPages = Math.ceil(sortedPosts.length / postsPerPage);

	const handlePrev = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	};

	const handleNext = () => {
		if (currentPage < totalPages) {
			setCurrentPage(currentPage + 1);
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	};

	return (
		<div className="space-y-16 sm:space-y-24 md:space-y-32">
			<header className="border-b-2 border-foreground/5 pb-8 sm:pb-16">
				<h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl italic leading-none text-foreground tracking-tighter">
					My Blog.
				</h1>
			</header>

			<div className="flex flex-col gap-px bg-foreground/10 border border-foreground/5 shadow-xl sm:shadow-2xl overflow-hidden">
				{currentPosts.map((post, i) => (
					<RouterLink
						key={post.slug}
						to={`/blog/${post.slug}`}
						className="bg-background p-8 sm:p-16 md:p-24 group hover:bg-accent-soft transition-all duration-500 block border-b border-foreground/5 last:border-0"
					>
						<div className="max-w-7xl mx-auto flex flex-col md:grid md:grid-cols-12 gap-6 md:gap-12 items-start md:items-center">
							<div className="md:col-span-3">
								<span className="text-[9px] sm:text-[10px] font-bold text-accent uppercase tracking-widest italic block mb-1 sm:mb-2">
									{post.date.toUpperCase()}
								</span>
								<span className="text-[8px] sm:text-[9px] font-black opacity-20 uppercase tracking-[0.3em]">
									BLOG_00{sortedPosts.length - indexOfFirstPost - i}
								</span>
							</div>
							<div className="md:col-span-7">
								<h2 className="text-2xl sm:text-4xl md:text-5xl italic md:group-hover:text-accent md:group-hover:translate-x-4 transition-all duration-500 text-foreground leading-tight">
									<MarkdownText content={post.title} />
								</h2>
								<p className="text-base sm:text-lg md:text-xl font-light italic mt-4 sm:mt-6 line-clamp-2 text-foreground">
									<MarkdownText content={post.description} />
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

				{totalPages > 1 && (
					<div className="flex flex-col sm:grid sm:grid-cols-12 bg-background border-t border-foreground/10">
						<button
							type="button"
							onClick={handlePrev}
							disabled={currentPage === 1}
							className="sm:col-span-4 p-8 sm:p-16 md:p-24 border-b sm:border-b-0 sm:border-r border-foreground/10 text-left transition-all group disabled:opacity-5"
						>
							<span className="text-[9px] font-black uppercase tracking-widest opacity-40 block mb-1 sm:mb-2">
								Back
							</span>
							<span className="text-lg sm:text-xl md:text-2xl font-serif italic text-foreground group-hover:text-accent transition-colors">
								Previous Page
							</span>
						</button>

						<div className="sm:col-span-4 p-8 sm:p-16 md:p-24 flex items-center justify-center text-xs md:text-sm font-black opacity-20 tracking-[0.3em] sm:tracking-[0.5em] text-foreground border-b sm:border-b-0 border-foreground/10">
							{currentPage.toString().padStart(2, "0")} {/* // */}{" "}
							{totalPages.toString().padStart(2, "0")}
						</div>

						<button
							type="button"
							onClick={handleNext}
							disabled={currentPage === totalPages}
							className="sm:col-span-4 p-8 sm:p-16 md:p-24 text-right transition-all group disabled:opacity-5 hover:bg-foreground hover:text-background"
						>
							<span className="text-[9px] font-black uppercase tracking-widest opacity-40 group-hover:text-accent block mb-1 sm:mb-2">
								Continue
							</span>
							<span className="text-lg sm:text-xl md:text-2xl font-serif italic group-hover:text-current">
								Next Page →
							</span>
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
