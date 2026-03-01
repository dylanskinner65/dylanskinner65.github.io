import { useState, useEffect } from "react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import { useSearch } from "../hooks/useSearch";

export function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const results = useSearch(query);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null) {
      setQuery(q);
    }
  }, [searchParams]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSearchParams(value ? { q: value } : {}, { replace: true });
  };

  return (
    <div className="space-y-16">
      <header className="border-b-2 border-foreground/5 pb-12">
        <h1 className="text-8xl md:text-[10rem] italic leading-none text-foreground tracking-tighter mb-8">Search Results</h1>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={handleSearchChange}
            placeholder="Search blog & projects..."
            className="w-full bg-transparent py-4 text-3xl md:text-4xl italic font-light focus:outline-none transition-colors placeholder:opacity-20 text-foreground tracking-tighter border-b border-foreground/10"
            autoFocus
          />
        </div>
      </header>

      <div className="flex flex-col gap-px bg-foreground/10 border border-foreground/5 shadow-2xl overflow-hidden">
        {results.length > 0 ? (
          results.map(({ item }, i) => (
            <RouterLink 
              key={`${item.type}-${item.slug}`} 
              to={`/${item.type === 'blog' ? 'blog' : 'projects'}/${item.slug}`}
              className="bg-background p-12 md:p-16 group hover:bg-accent-soft transition-all duration-500 block border-b border-foreground/5 last:border-0"
            >
              <div className="max-w-7xl mx-auto grid md:grid-cols-12 gap-12 items-center">
                <div className="md:col-span-3">
                  <span className="text-[10px] font-bold text-accent uppercase tracking-widest italic block mb-2">
                    {item.type.toUpperCase()} // {item.date.toUpperCase()}
                  </span>
                  <span className="text-[9px] font-black opacity-20 uppercase tracking-[0.3em]">RESULT_00{i + 1}</span>
                </div>
                <div className="md:col-span-7">
                  <h2 className="text-4xl md:text-5xl italic group-hover:text-accent group-hover:translate-x-4 transition-all duration-500 text-foreground">
                    {item.title}
                  </h2>
                  <p className="text-lg opacity-40 font-light italic mt-6 line-clamp-2 text-foreground">
                    {item.description}
                  </p>
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <div className="w-12 h-12 border border-foreground/10 rounded-full flex items-center justify-center group-hover:bg-accent group-hover:border-accent group-hover:text-white transition-all text-foreground text-2xl font-serif">
                    →
                  </div>
                </div>
              </div>
            </RouterLink>
          ))
        ) : query ? (
          <div className="bg-background p-32 text-center">
            <p className="text-2xl italic opacity-40 text-foreground">No results found for "{query}"</p>
          </div>
        ) : (
          <div className="bg-background p-32 text-center">
            <p className="text-2xl italic opacity-40 text-foreground">Enter a search term to find blog posts and projects.</p>
          </div>
        )}
      </div>
    </div>
  );
}
