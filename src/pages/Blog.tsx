import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import contentData from "../data/content.json";

export function Blog() {
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;

  const sortedPosts = [...contentData.blog].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = sortedPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(sortedPosts.length / postsPerPage);

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-32">
      <header className="border-b-2 border-foreground/5 pb-16">
        <h1 className="text-8xl md:text-[10rem] italic leading-none text-foreground tracking-tighter">The Blog</h1>
      </header>

      <div className="flex flex-col gap-px bg-foreground/10 border border-foreground/5 shadow-2xl overflow-hidden">
        {currentPosts.map((post, i) => (
          <RouterLink 
            key={i} 
            to={`/blog/${post.slug}`}
            className="bg-background p-12 md:p-16 group hover:bg-accent-soft transition-all duration-500 block border-b border-foreground/5 last:border-0"
          >
            <div className="max-w-7xl mx-auto grid md:grid-cols-12 gap-12 items-center">
              <div className="md:col-span-3">
                <span className="text-[10px] font-bold text-accent uppercase tracking-widest italic block mb-2">{post.date.toUpperCase()}</span>
                <span className="text-[9px] font-black opacity-20 uppercase tracking-[0.3em]">BLOG_00{sortedPosts.length - indexOfFirstPost - i}</span>
              </div>
              <div className="md:col-span-7">
                <h2 className="text-4xl md:text-6xl italic group-hover:text-accent group-hover:translate-x-4 transition-all duration-500 text-foreground">{post.title}</h2>
                <p className="text-lg opacity-40 font-light italic mt-6 line-clamp-2 text-foreground">{post.description}</p>
              </div>
              <div className="md:col-span-2 flex justify-end">
                <div className="w-12 h-12 border border-foreground/10 rounded-full flex items-center justify-center group-hover:bg-accent group-hover:border-accent group-hover:text-white transition-all text-foreground">
                  →
                </div>
              </div>
            </div>
          </RouterLink>
        ))}

        {/* Split Contrast Pagination */}
        {totalPages > 1 && (
          <div className="grid grid-cols-12 bg-background border-t border-foreground/10">
            <button 
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="col-span-4 p-8 md:p-12 border-r border-foreground/10 text-left transition-all group disabled:opacity-5"
            >
              <span className="text-[9px] font-black uppercase tracking-widest opacity-40 block mb-2">Back</span>
              <span className="text-xl md:text-2xl font-serif italic text-foreground group-hover:text-accent transition-colors">Previous Page</span>
            </button>
            
            <div className="col-span-4 p-8 md:p-12 flex items-center justify-center text-xs md:text-sm font-black opacity-20 tracking-[0.5em] text-foreground">
              {currentPage.toString().padStart(2, '0')} // {totalPages.toString().padStart(2, '0')}
            </div>

            <button 
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="col-span-4 p-8 md:p-12 border-l border-foreground/10 text-right transition-all group disabled:opacity-5 hover:bg-foreground hover:text-background"
            >
              <span className="text-[9px] font-black uppercase tracking-widest opacity-40 group-hover:text-accent block mb-2">Continue</span>
              <span className="text-xl md:text-2xl font-serif italic group-hover:text-current">Next Page →</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
