import { Link as RouterLink } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import contentData from "../data/content.json";

export function Home() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // GRADUAL TRANSFORMS - Tied to a longer range [0, 0.4] for a fluid feel
  const titleScale = useTransform(scrollYProgress, [0, 0.4], [1, 0.25]);
  const titleX = useTransform(scrollYProgress, [0, 0.4], [0, -50]);
  const titleY = useTransform(scrollYProgress, [0, 0.4], [0, -140]);
  
  const heroDetailsOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroDetailsY = useTransform(scrollYProgress, [0, 0.2], [0, -20]);

  const bioOpacity = useTransform(scrollYProgress, [0.2, 0.5], [0, 1]);
  const bioY = useTransform(scrollYProgress, [0.2, 0.5], [100, 0]);

  const photoY = useTransform(scrollYProgress, [0, 0.4], [0, 160]);

  const latestPosts = [...contentData.blog]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  const featured = latestPosts[0];
  const others = latestPosts.slice(1);

  const experience = [
    {
      company: "SchoolAI",
      role: "AI Engineer",
      date: "2025 — Present",
      desc: (
        <div className="space-y-6">
          <p className="text-2xl font-light italic leading-relaxed opacity-70 max-w-3xl text-foreground text-pretty">
            Architecting a platform serving <span className="text-accent font-medium italic">3B tokens/day</span>. 
            Slashed LLM costs by <span className="text-accent font-medium italic">$8k/day</span> through vendor optimization and prompt caching. 
            Built real-time token/cost tracking and mentor an apprentice engineer.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-black uppercase tracking-widest opacity-60">
            <span>LLM Infrastructure</span>
            <span>Vendor Strategy</span>
            <span>Model Tracking</span>
            <span>Mentorship</span>
          </div>
        </div>
      )
    },
    {
      company: "e-TeleQuote",
      role: "Data Scientist",
      date: "2024 — 2025",
      desc: (
        <>
          Worked closely with financial planning and sales teams to obtain data-driven insights. 
          Models included <span className="text-accent font-medium italic">bayesian hierarchical models</span>, 
          CatBoost, and gamma-poisson architectures.
        </>
      )
    },
    {
      company: "BYU Research",
      role: "Mathematics Research Assistant",
      date: "2021 — 2024",
      desc: (
        <div className="space-y-4 text-foreground/70 text-pretty">
          <p>
            Research assistant for <a href="https://science.byu.edu/directory/mark-hughes" target="_blank" className="text-accent underline underline-offset-4">Dr. Mark Hughes</a>. 
            Applied deep reinforcement learning (PPO) to 4D topology. 
            Presented at JMM Boston/SF and published an honors thesis.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-black uppercase tracking-widest opacity-60">
            <a href="/BostonPresentation.pdf" target="_blank" className="hover:text-accent transition-colors underline decoration-2 underline-offset-4">JMM Boston</a>
            <a href="/San Francisco Presentation.pdf" target="_blank" className="hover:text-accent transition-colors underline decoration-2 underline-offset-4">JMM San Fran</a>
            <a href="/mlops_talk.pdf" target="_blank" className="hover:text-accent transition-colors underline decoration-2 underline-offset-4">MLOps Talk</a>
            <a href="/Using Deep Learning Techniques to Find the 4D Slice Genus of a Kn.pdf" target="_blank" className="hover:text-accent transition-colors underline decoration-2 underline-offset-4">Honors Thesis</a>
          </div>
        </div>
      )
    },
    {
      company: "Harbor Health",
      role: "Data Science Intern",
      date: "2023",
      desc: "Developed time series forecasting and LLM-based data matching systems for healthcare optimization."
    },
    {
      company: "BYU TA",
      role: "R Programming Teaching Assistant",
      date: "2022",
      desc: "Instructed students in statistical modeling and tidyverse-based visualization in R."
    }
  ];

  return (
    <div className="space-y-32">
      {/* Animated Hero Section */}
      <section ref={containerRef} className="relative h-[180vh] -mt-12">
        <div className="sticky top-0 h-screen flex flex-col justify-start">
          <div className="max-w-7xl w-full mx-auto">
            
            <div className="grid lg:grid-cols-12 gap-12 items-start relative pt-4">
              
              <div className="lg:col-span-8 relative">
                <motion.div style={{ scale: titleScale, x: titleX, y: titleY }} className="origin-left z-30 relative">
                  <h1 className="text-8xl md:text-[10rem] leading-none italic tracking-tighter text-foreground text-pretty pb-4">
                    Dylan Skinner
                  </h1>
                </motion.div>
                
                <motion.div style={{ opacity: heroDetailsOpacity, y: heroDetailsY }} className="mt-8 space-y-8">
                  <h2 className="text-4xl md:text-5xl italic opacity-40 font-light text-foreground text-pretty">
                    AI Engineer. Researcher.
                  </h2>
                  <p className="text-2xl md:text-3xl font-light italic leading-relaxed opacity-60 max-w-2xl text-foreground text-pretty">
                    Technical explorations into high-fidelity AI agents and four-dimensional topological manifold analysis.
                  </p>
                </motion.div>

                {/* Scrolled View: Bio Box */}
                <motion.div 
                  style={{ opacity: bioOpacity, y: bioY }} 
                  className="absolute top-[160px] left-0 w-full z-20"
                >
                  <div className="p-12 md:p-16 border border-foreground/5 bg-background shadow-[0_40px_100px_rgba(0,0,0,0.1)]">
                    <p className="text-3xl md:text-4xl italic font-light leading-relaxed opacity-80 text-foreground text-pretty">
                      I am an <span className="text-accent font-medium italic underline underline-offset-8 decoration-1">AI Engineer</span> currently pursuing my Master's at Georgia Tech. 
                      I focus on autonomous workflows and the geometric foundations of deep reinforcement learning.
                    </p>
                    <div className="mt-16 flex items-center gap-12">
                      <RouterLink 
                        to="/blog" 
                        className="inline-block px-12 py-6 bg-foreground text-background font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-xl text-foreground"
                      >
                        Explore Research Blog
                      </RouterLink>
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="lg:col-span-4">
                <motion.div style={{ y: photoY }} className="relative group z-10">
                  <div className="absolute -inset-4 border border-emerald-900/5 transition-colors group-hover:border-accent/20"></div>
                  <img 
                    src="/me.png" 
                    alt="Dylan Skinner" 
                    className="w-full aspect-[3/4] object-cover border-4 border-white shadow-2xl transition-all duration-700"
                  />
                </motion.div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Executive Ledger */}
      <section id="experience" className="relative z-40 -mt-24">
        <div className="flex items-baseline justify-between mb-16 border-b-2 border-foreground/5 pb-8">
          <h2 className="text-5xl md:text-6xl font-serif italic leading-none text-accent text-foreground">Experience</h2>
        </div>
        
        <div className="grid gap-px bg-foreground/10 border border-foreground/5 shadow-2xl overflow-hidden">
          {experience.map((exp, i) => (
            <div key={i} className="bg-background p-12 grid md:grid-cols-12 gap-8 hover:bg-accent-soft transition-colors group border-b border-foreground/5 last:border-0">
              <div className="md:col-span-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-accent italic opacity-60">{exp.date}</span>
                <h3 className="mt-2 text-4xl md:text-5xl italic leading-none text-foreground">{exp.company}</h3>
              </div>
              <div className="md:col-span-9">
                <span className="text-xs font-black uppercase tracking-widest opacity-40 block mb-4 text-foreground">{exp.role}</span>
                <div className="text-xl md:text-2xl font-light italic leading-relaxed opacity-70 max-w-3xl text-foreground text-pretty">
                  {exp.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Blog */}
      <section id="blog" className="pb-32">
        <div className="flex items-baseline justify-between mb-24 border-b-2 border-foreground/5 pb-8">
          <h2 className="text-7xl md:text-8xl font-serif italic leading-none text-foreground text-pretty">The Blog</h2>
          <RouterLink to="/blog" className="text-[10px] font-black uppercase tracking-[0.3em] hover:text-accent opacity-40 hover:opacity-100 transition-all text-foreground text-pretty">View All Entries →</RouterLink>
        </div>
        
        <div className="grid lg:grid-cols-12 gap-px bg-foreground/10 border border-foreground/5 shadow-2xl overflow-hidden">
          <div className="lg:col-span-7 bg-background p-12 md:p-20 flex flex-col justify-between gap-16">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-accent mb-6 block italic">{featured.date.toUpperCase()}</span>
              <h3 className="text-5xl md:text-7xl italic leading-[0.9] mb-8 text-foreground text-pretty">{featured.title}</h3>
              <p className="text-xl md:text-2xl font-light italic opacity-60 leading-relaxed line-clamp-3 text-pretty text-foreground">
                {featured.description}
              </p>
            </div>
            <RouterLink 
              to={`/blog/${featured.slug}`} 
              className="text-xs font-black uppercase tracking-widest border-b-2 border-accent self-start hover:text-accent transition-colors pb-1 text-foreground"
            >
              Read Full Entry
            </RouterLink>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-px">
             {others.map((post, i) => (
               <RouterLink 
                 key={i} 
                 to={`/blog/${post.slug}`}
                 className="bg-background p-12 flex-1 flex flex-col justify-between group hover:bg-accent-soft transition-colors"
               >
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-accent mb-4 block italic">{post.date.toUpperCase()}</span>
                    <h4 className="text-3xl md:text-4xl italic group-hover:text-accent transition-colors mb-4 text-foreground text-pretty">{post.title}</h4>
                    <p className="text-base font-light italic opacity-50 line-clamp-2 text-foreground text-pretty">{post.description}</p>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-accent mt-8 opacity-0 group-hover:opacity-100 transition-all">Open Blog →</span>
               </RouterLink>
             ))}
          </div>
        </div>
      </section>
    </div>
  );
}
