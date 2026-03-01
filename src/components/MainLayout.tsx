import { useState, useEffect, useRef } from "react";
import { Link as RouterLink, Outlet, NavLink, useNavigate } from "react-router-dom";
import { useSearch } from "../hooks/useSearch";

export function MainLayout() {
  const activeClass = "text-accent underline underline-offset-8 decoration-2 opacity-100";
  const inactiveClass = "hover:text-accent transition-colors opacity-60";
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useSearch(searchValue);

  const displayedResults = results.slice(0, 5);
  const hasMoreResults = results.length > 5;
  const totalSelectableItems = displayedResults.length + (hasMoreResults ? 1 : 0);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    
    function handleGlobalKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setShowResults(false);
        inputRef.current?.blur();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, []);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [searchValue]);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchValue.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`);
      setSearchValue("");
      setShowResults(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev < totalSelectableItems - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      if (selectedIndex >= 0 && selectedIndex < displayedResults.length) {
        e.preventDefault();
        const item = displayedResults[selectedIndex].item;
        navigate(`/${item.type === 'blog' ? 'blog' : 'projects'}/${item.slug}`);
        setSearchValue("");
        setShowResults(false);
      } else if (selectedIndex === displayedResults.length && hasMoreResults) {
        e.preventDefault();
        handleSearch();
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground antialiased font-sans flex flex-col">
      <header className="w-full max-w-7xl mx-auto px-6 md:px-12 pt-16 md:pt-24 mb-12 text-foreground">
        <div className="flex flex-col md:flex-row justify-between items-baseline gap-8 border-b border-foreground/5 pb-12">
          <div>
            <RouterLink to="/" className="text-3xl md:text-4xl font-serif italic tracking-tight hover:text-accent transition-colors">
              Dylan Skinner / <span className="opacity-40 not-italic font-sans text-xl md:text-2xl">Researcher</span>
            </RouterLink>
          </div>
          
          <nav className="flex items-center gap-10 text-[10px] font-black uppercase tracking-widest relative">
            <div ref={searchRef} className="relative group">
              <form onSubmit={handleSearch}>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="SEARCH... (⌘K)"
                  value={searchValue}
                  onChange={(e) => {
                    setSearchValue(e.target.value);
                    setShowResults(true);
                  }}
                  onFocus={() => setShowResults(true)}
                  onKeyDown={handleKeyDown}
                  className="bg-transparent border-b border-foreground/10 focus:border-accent focus:outline-none py-1 w-24 group-hover:w-32 focus:w-48 transition-all duration-500 placeholder:opacity-20 text-[10px]"
                />
              </form>
              
              {showResults && searchValue.trim() && (
                <div className="absolute top-full left-0 mt-4 w-64 md:w-80 bg-background border border-foreground/5 shadow-2xl z-50 overflow-hidden">
                  <div className="flex flex-col">
                    {results.length > 0 ? (
                      <>
                        {displayedResults.map(({ item }, index) => (
                          <RouterLink
                            key={`${item.type}-${item.slug}`}
                            to={`/${item.type === 'blog' ? 'blog' : 'projects'}/${item.slug}`}
                            onClick={() => {
                              setShowResults(false);
                              setSearchValue("");
                            }}
                            className={`p-4 border-b border-foreground/5 transition-colors group ${
                              selectedIndex === index ? "bg-accent-soft text-accent" : "hover:bg-accent-soft"
                            }`}
                          >
                            <span className="text-[8px] font-bold text-accent italic block mb-1">
                              {item.type.toUpperCase()} // {item.date.toUpperCase()}
                            </span>
                            <span className={`text-xs italic transition-colors block leading-tight ${
                              selectedIndex === index ? "text-accent" : "group-hover:text-accent"
                            }`}>
                              {item.title}
                            </span>
                          </RouterLink>
                        ))}
                        {hasMoreResults && (
                          <button
                            onClick={() => handleSearch()}
                            className={`p-3 text-[8px] font-black uppercase tracking-widest transition-all text-center bg-foreground/5 ${
                              selectedIndex === displayedResults.length ? "text-accent bg-accent-soft opacity-100" : "opacity-40 hover:opacity-100 hover:text-accent"
                            }`}
                          >
                            View All {results.length} Results →
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="p-4 text-[8px] italic opacity-40">No results found</div>
                    )}
                  </div>
                </div>
              )}
            </div>
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
