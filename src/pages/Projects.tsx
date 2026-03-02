import { Link as RouterLink } from "react-router-dom";
import { motion } from "framer-motion";
import contentData from "../data/content.json";
import { Magnetic } from "../components/Magnetic";

export function Projects() {
  const springConfig = { stiffness: 300, damping: 20 };

  return (
    <div className="space-y-32">
      <header className="max-w-4xl space-y-8 border-b-2 border-foreground/5 pb-16 text-foreground">
        <h1 className="text-8xl md:text-[10rem] italic leading-none tracking-tighter">Projects.</h1>
        <p className="text-2xl md:text-3xl opacity-40 font-light italic leading-relaxed">
          Computational experiments in topology, predictive modeling, and machine learning research.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-12">
        {contentData.projects
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .map((project, i) => {
            const isLongTitle = project.title.length > 25;
            
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, ...springConfig }}
                whileHover={{ y: -10 }}
              >
                <RouterLink 
                  to={`/projects/${project.slug}`}
                  className="bg-background border border-foreground/5 p-12 shadow-xl hover:shadow-2xl transition-all group flex flex-col justify-between h-[500px] relative overflow-hidden"
                >
                  <div>
                    <div className="flex justify-between items-start mb-8">
                      <span className="text-[10px] font-black text-accent italic uppercase tracking-[0.3em]">
                        {project.field || "Research"} // {project.date.split('-')[0]}
                      </span>
                      <span className="text-[9px] font-bold opacity-20 uppercase tracking-widest">
                        PROJ_0{contentData.projects.length - i}
                      </span>
                    </div>
                    <motion.h2 
                      whileHover={{ fontVariationSettings: '"wght" 600' }}
                      className={`${isLongTitle ? 'text-5xl md:text-6xl' : 'text-6xl md:text-7xl'} italic leading-[0.85] tracking-tighter mb-8 group-hover:translate-x-4 transition-all duration-500 text-foreground text-pretty`}
                    >
                      {project.title}
                    </motion.h2>
                    <p className="text-lg md:text-xl opacity-40 font-light italic leading-relaxed line-clamp-3 text-foreground text-pretty">
                      {project.description}
                    </p>
                  </div>
                  
                  <div className="pt-8 border-t border-foreground/5 flex justify-between items-center mt-auto">
                    <div className="flex gap-3">
                      {project.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[9px] font-black uppercase tracking-widest opacity-30 group-hover:opacity-100 transition-all text-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Magnetic strength={0.2}>
                      <span className="text-accent font-bold italic group-hover:translate-x-2 transition-transform">View_Research →</span>
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
