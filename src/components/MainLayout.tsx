import { Link as RouterLink, Outlet, NavLink } from "react-router-dom";
import { CommandPalette } from "./CommandPalette";
import { ThemeToggle } from "./ThemeToggle";
import { Search } from "lucide-react";

export function MainLayout() {
  const activeClass = "text-accent underline underline-offset-8 decoration-2 opacity-100";
  const inactiveClass = "hover:text-accent transition-colors opacity-60";

  return (
    <div className="min-h-screen bg-background text-foreground antialiased font-sans flex flex-col selection:bg-accent selection:text-white">
      <CommandPalette />
      
      <header className="w-full max-w-7xl mx-auto px-6 md:px-12 pt-16 md:pt-24 mb-12 text-foreground">
        <div className="flex flex-col md:flex-row justify-between items-baseline gap-8 border-b border-foreground/5 pb-12">
          <div className="flex flex-col gap-2">
            <RouterLink to="/" className="text-3xl md:text-4xl font-serif italic tracking-tight hover:text-accent transition-colors group">
              Dylan Skinner / <span className="opacity-40 not-italic font-sans text-xl md:text-2xl group-hover:opacity-100 transition-opacity">Researcher</span>
            </RouterLink>
          </div>
          
          <nav className="flex items-center gap-6 md:gap-10 text-[10px] font-black uppercase tracking-widest">
            <button 
              onClick={() => {
                const down = new KeyboardEvent('keydown', {
                  key: 'k',
                  metaKey: true
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
              className={({ isActive }) => isActive ? activeClass : inactiveClass}
            >
              Index
            </NavLink>
            <NavLink 
              to="/blog" 
              className={({ isActive }) => isActive ? activeClass : inactiveClass}
            >
              Blog
            </NavLink>
            <NavLink 
              to="/projects" 
              className={({ isActive }) => isActive ? activeClass : inactiveClass}
            >
              Projects
            </NavLink>
            <a 
              href="/Dylan Skinner - Resume (Website - 21 Jan).pdf" 
              target="_blank"
              className={inactiveClass}
            >
              Resume
            </a>
            
            <div className="h-4 w-px bg-foreground/10 mx-2 hidden sm:block" />
            
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 md:px-12 pb-32">
        <Outlet />
      </main>

      <footer className="w-full border-t border-foreground/5 py-16 px-6 md:px-12 bg-background text-foreground">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 italic">
            © 2026 DYLAN SKINNER // ALL RIGHTS RESERVED
          </div>
          <div className="flex gap-10 text-[10px] font-black uppercase tracking-widest opacity-40">
            <a href="https://github.com/dylanskinner65" target="_blank" className="hover:text-accent transition-colors">Github</a>
            <a href="https://linkedin.com/in/dylanskinner65" target="_blank" className="hover:text-accent transition-colors">LinkedIn</a>
            <a href="mailto:DylanSkinner65@gmail.com" className="hover:text-accent transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
