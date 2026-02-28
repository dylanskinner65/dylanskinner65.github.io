import { useParams, Navigate } from "react-router-dom";
import { useLayoutEffect, useRef } from "react";
import { renderContent } from "../components/ContentParser";
import contentData from "../data/content.json";

export function DynamicProject() {
  const { slug } = useParams();
  const project = contentData.projects.find((p) => p.slug === slug);
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const { MathJax } = window;

    if (MathJax && containerRef.current) {
      if (MathJax.texLabelsClear) {
        MathJax.texLabelsClear();
      }
      if (MathJax.typesetClear) {
        MathJax.typesetClear([containerRef.current]);
      }
      MathJax.startup.promise = MathJax.startup.promise
        .then(() => {
          return MathJax.typesetPromise([containerRef.current]);
        })
        .catch((err: any) => console.error("MathJax typesetting failed:", err));
    }
  }, [slug, project]);

  if (!project) {
    return <Navigate to="/projects" replace />;
  }

  return (
    <div ref={containerRef}>
      <article className="max-w-4xl mx-auto space-y-24 pb-32">
        <header className="space-y-8">
          <div className="flex items-center gap-4 text-xs font-black text-accent uppercase tracking-[0.5em]">
            <time>{project.date}</time>
            <span className="opacity-30">•</span>
            <span>PROJECT</span>
          </div>
          <h1 className="text-7xl md:text-9xl font-serif font-black tracking-tighter leading-[0.85] uppercase text-foreground">
            {project.title}
          </h1>
          <p className="text-2xl md:text-3xl text-muted-foreground italic font-medium max-w-2xl leading-relaxed">
            {project.description}
          </p>
        </header>

        <div className="prose prose-xl max-w-none text-foreground/80 leading-[1.8] space-y-12 font-sans">
          {renderContent(project.content)}
        </div>
      </article>
    </div>
  );
}
