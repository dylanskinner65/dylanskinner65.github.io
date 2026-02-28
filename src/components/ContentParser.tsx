import parse, { domToReact } from "html-react-parser";
import type { HTMLReactParserOptions } from "html-react-parser";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

const fixPath = (src: string) => {
  if (!src) return "";
  // Remove any relative prefixes like ../ or ./
  let cleanSrc = src.replace(/^(\.\.\/|\.\/)+/, "");
  // Ensure it starts with / if it points to technical files
  if ((cleanSrc.includes("blog_files/") || cleanSrc.includes("projects_files/")) && !cleanSrc.startsWith("/")) {
    cleanSrc = "/" + cleanSrc;
  }
  return cleanSrc;
};

export const renderContent = (html: string) => {
  const options: HTMLReactParserOptions = {
    replace: (domNode: any) => {
      if (domNode.type === 'tag' || domNode.name) {
        
        // 1. Fix image paths (Highest priority)
        if (domNode.name === "img") {
          const src = fixPath(domNode.attribs.src);
          // Return a simple img tag first to see if it renders
          return (
            <img 
              {...domNode.attribs} 
              src={src} 
              className="w-full h-auto rounded-none shadow-2xl border border-foreground/5 my-12" 
            />
          );
        }

        // 2. Headings
        if (domNode.name === "h2" || domNode.name === "h3" || domNode.name === "h4") {
          const Tag = domNode.name as any;
          const classMap: any = {
            h2: "text-6xl md:text-8xl mt-32 mb-12 italic border-b-2 border-foreground/5 pb-8",
            h3: "text-5xl md:text-7xl mt-24 mb-8 italic",
            h4: "text-4xl md:text-6xl mt-24 mb-8 italic opacity-90"
          };
          return (
            <Tag className={`${classMap[domNode.name]} text-foreground`}>
              {domToReact(domNode.children, options)}
            </Tag>
          );
        }

        // 3. Lists
        if (domNode.name === "ul" || domNode.name === "ol") {
          return (
            <div className="my-16 p-8 md:p-12 border border-foreground/5 bg-foreground/5 shadow-inner">
              <ul className="space-y-6 list-none p-0 m-0">
                {domToReact(domNode.children, options)}
              </ul>
            </div>
          );
        }
        if (domNode.name === "li") {
          return (
            <li className="text-lg md:text-xl font-light italic opacity-70 leading-relaxed flex gap-6">
              <span className="text-accent font-black not-italic shrink-0 mt-1">•</span>
              <span>{domToReact(domNode.children, options)}</span>
            </li>
          );
        }

        // 4. Tables
        if (domNode.name === "table") {
          return (
            <div className="my-20 overflow-x-auto shadow-2xl border border-foreground/10 p-1 bg-foreground/5">
              <table className="w-full border-collapse bg-background text-left min-w-[600px] border-hidden">
                {domToReact(domNode.children, options)}
              </table>
            </div>
          );
        }
        if (domNode.name === "th") {
          return (
            <th {...domNode.attribs} className="p-6 border border-foreground/10 bg-emerald-900 text-white dark:bg-emerald-500 dark:text-emerald-950 uppercase text-[10px] font-black tracking-widest">
              {domToReact(domNode.children, options)}
            </th>
          );
        }
        if (domNode.name === "td") {
          return (
            <td {...domNode.attribs} className="p-6 border border-foreground/10 text-lg font-light italic opacity-80 transition-opacity">
              {domToReact(domNode.children, options)}
            </td>
          );
        }

        // 5. Code blocks
        if (domNode.name === "pre") {
           const codeNode = domNode.children.find((c: any) => c.name === "code") || domNode.children[0];
           const codeText = codeNode?.children?.[0]?.data || "";
           const className = codeNode?.attribs?.class || "";
           const lang = className.includes("python") ? "python" : "javascript";
           
           return (
            <div className="p-1 bg-foreground/10 my-12 not-prose shadow-xl border border-foreground/5">
              <SyntaxHighlighter 
                language={lang} 
                style={oneLight} 
                customStyle={{ padding: '2rem', background: '#fff', fontSize: '0.9rem' }}
              >
                {codeText.trim()}
              </SyntaxHighlighter>
            </div>
           );
        }

        // 6. Links
        if (domNode.name === "a") {
           return (
             <a {...domNode.attribs} className="text-accent font-bold border-b-2 border-accent/20 hover:border-accent transition-colors">
               {domToReact(domNode.children, options)}
             </a>
           );
        }
      }
    }
  };

  return parse(html, options);
};
