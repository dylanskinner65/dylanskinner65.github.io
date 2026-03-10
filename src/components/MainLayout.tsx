import { Search } from "lucide-react";
import { NavLink, Link as RouterLink, Outlet } from "react-router-dom";
import { CommandPalette } from "./CommandPalette";
import { ThemeToggle } from "./ThemeToggle";

export function MainLayout() {
	const activeClass =
		"text-accent underline underline-offset-8 decoration-2 opacity-100";
	const inactiveClass = "hover:text-accent transition-colors opacity-60";

	return (
		<div className="min-h-screen bg-background text-foreground antialiased font-sans flex flex-col selection:bg-accent selection:text-white">
			<CommandPalette />

			<header className="w-full max-w-7xl mx-auto px-8 sm:px-16 md:px-24 pt-8 sm:pt-16 md:pt-24 mb-8 sm:mb-12 text-foreground">
				<div className="flex flex-col md:flex-row justify-between items-center md:items-baseline gap-6 sm:gap-8 border-b border-foreground/5 pb-8 sm:pb-12">
					<div className="text-center md:text-left">
						<RouterLink
							to="/"
							className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif italic tracking-tight hover:text-accent transition-colors group"
						>
							Dylan Skinner /{" "}
							<span className="opacity-40 not-italic font-sans text-lg sm:text-xl md:text-2xl group-hover:opacity-100 transition-opacity">
								Researcher
							</span>
						</RouterLink>
					</div>

					<nav className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 md:gap-10 text-[10px] sm:text-[11px] md:text-xs font-black uppercase tracking-widest">
						<button
							type="button"
							onClick={() => {
								const down = new KeyboardEvent("keydown", {
									key: "k",
									metaKey: true,
								});
								document.dispatchEvent(down);
							}}
							className="flex items-center gap-2 opacity-40 hover:opacity-100 hover:text-accent transition-all cursor-pointer group"
						>
							<Search className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
							<span className="hidden sm:inline">SEARCH... (⌘K)</span>
						</button>

						<NavLink
							to="/"
							className={({ isActive }) =>
								isActive ? activeClass : inactiveClass
							}
						>
							Index
						</NavLink>
						<NavLink
							to="/blog"
							className={({ isActive }) =>
								isActive ? activeClass : inactiveClass
							}
						>
							Blog
						</NavLink>
						<NavLink
							to="/projects"
							className={({ isActive }) =>
								isActive ? activeClass : inactiveClass
							}
						>
							Projects
						</NavLink>
						<a
							href="/Dylan Skinner - Resume (Website - 21 Jan).pdf"
							target="_blank"
							className={inactiveClass}
							rel="noreferrer"
						>
							Resume
						</a>

						<div className="h-4 w-px bg-foreground/10 mx-2 hidden sm:block" />

						<ThemeToggle />
					</nav>
				</div>
			</header>

			<main className="flex-1 w-full max-w-7xl mx-auto px-8 sm:px-16 md:px-24 pb-16 sm:pb-24 md:pb-32">
				<Outlet />
			</main>

			<footer className="w-full border-t border-foreground/5 py-12 sm:py-16 px-8 sm:px-16 md:px-24 bg-background text-foreground">
				<div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 sm:gap-12">
					<div className="text-[10px] sm:text-[11px] md:text-xs font-black uppercase tracking-[0.3em] opacity-30 italic text-center md:text-left">
						© 2026 DYLAN SKINNER {/* // */} ALL RIGHTS RESERVED
					</div>
					<div className="flex gap-6 sm:gap-10 text-[10px] sm:text-[11px] md:text-xs font-black uppercase tracking-widest opacity-40">
						<a
							href="https://github.com/dylanskinner65"
							target="_blank"
							className="hover:text-accent transition-colors"
							rel="noreferrer"
						>
							Github
						</a>
						<a
							href="https://linkedin.com/in/dylanskinner65"
							target="_blank"
							className="hover:text-accent transition-colors"
							rel="noreferrer"
						>
							LinkedIn
						</a>
						<a
							href="mailto:DylanSkinner65@gmail.com"
							className="hover:text-accent transition-colors"
						>
							Contact
						</a>
					</div>
				</div>
			</footer>
		</div>
	);
}
