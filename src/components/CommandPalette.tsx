import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Moon, 
  Sun, 
  Mail, 
  Download, 
  Home, 
  BookOpen, 
  Code,
  ArrowRight
} from 'lucide-react';
import { useTheme } from '../hooks/ThemeContext';
import { useSearch } from '../hooks/useSearch';
import { motion, AnimatePresence } from 'framer-motion';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { setTheme, resolvedTheme } = useTheme();
  const results = useSearch(query);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // Toggle Command Palette
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }

      // Global Quick Actions when palette is NOT open
      if (!open) {
        if (e.key.toLowerCase() === 't') {
          // Check if user is typing in an input
          if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
            setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
          }
        }
        if (e.key.toLowerCase() === 'e') {
           if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
            navigator.clipboard.writeText('DylanSkinner65@gmail.com');
            // We could add a toast here later
          }
        }
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, resolvedTheme, setTheme]);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm" 
            onClick={() => setOpen(false)} 
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-[640px] bg-surface border border-foreground/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            <Command 
              className="flex flex-col h-full max-h-[480px]"
              onKeyDown={(e) => {
                if (e.key === 'Escape') setOpen(false);
              }}
            >
              <div className="flex items-center px-6 py-4 border-b border-foreground/5">
                <Search className="w-4 h-4 mr-4 opacity-40" />
                <Command.Input
                  autoFocus
                  placeholder="Type a command or search..."
                  value={query}
                  onValueChange={setQuery}
                  className="w-full bg-transparent border-none outline-none text-foreground placeholder:text-foreground/20 text-sm font-sans"
                />
              </div>

              <Command.List className="overflow-y-auto overflow-x-hidden p-2 scroll-smooth">
                <Command.Empty className="px-6 py-12 text-center text-sm text-foreground/40 italic font-serif">
                  No results found for "{query}"
                </Command.Empty>

                {query.length > 0 && results.length > 0 && (
                  <Command.Group heading="SEARCH RESULTS" className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-accent/60 italic">
                    {results.slice(0, 8).map(({ item }) => (
                      <Command.Item
                        key={`${item.type}-${item.slug}`}
                        onSelect={() => runCommand(() => navigate(`/${item.type === 'blog' ? 'blog' : 'projects'}/${item.slug}`))}
                        className="flex items-center gap-4 px-4 py-3 rounded-lg cursor-pointer aria-selected:bg-accent-soft aria-selected:text-accent group transition-colors select-none"
                      >
                        <div className="w-8 h-8 rounded-md bg-accent/10 flex items-center justify-center group-aria-selected:bg-accent/20 transition-colors">
                          {item.type === 'blog' ? <BookOpen className="w-4 h-4" /> : <Code className="w-4 h-4" />}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium transition-colors">{item.title}</span>
                          <span className="text-[10px] opacity-40 uppercase tracking-wider">{item.type} // {item.date}</span>
                        </div>
                        <ArrowRight className="w-3 h-3 ml-auto opacity-0 group-aria-selected:opacity-40 transition-all -translate-x-2 group-aria-selected:translate-x-0" />
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}

                <Command.Group heading="NAVIGATION" className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-foreground/20 italic">
                  <Command.Item
                    onSelect={() => runCommand(() => navigate('/'))}
                    className="flex items-center gap-4 px-4 py-3 rounded-lg cursor-pointer aria-selected:bg-accent-soft aria-selected:text-accent group transition-colors select-none"
                  >
                    <Home className="w-4 h-4 opacity-40 group-aria-selected:opacity-100" />
                    <span className="text-sm font-medium">Home</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => navigate('/blog'))}
                    className="flex items-center gap-4 px-4 py-3 rounded-lg cursor-pointer aria-selected:bg-accent-soft aria-selected:text-accent group transition-colors select-none"
                  >
                    <BookOpen className="w-4 h-4 opacity-40 group-aria-selected:opacity-100" />
                    <span className="text-sm font-medium">Blog</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => navigate('/projects'))}
                    className="flex items-center gap-4 px-4 py-3 rounded-lg cursor-pointer aria-selected:bg-accent-soft aria-selected:text-accent group transition-colors select-none"
                  >
                    <Code className="w-4 h-4 opacity-40 group-aria-selected:opacity-100" />
                    <span className="text-sm font-medium">Projects</span>
                  </Command.Item>
                </Command.Group>

                <Command.Group heading="ACTIONS" className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-foreground/20 italic">
                  <Command.Item
                    onSelect={() => runCommand(() => {
                      setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
                    })}
                    className="flex items-center gap-4 px-4 py-3 rounded-lg cursor-pointer aria-selected:bg-accent-soft aria-selected:text-accent group transition-colors select-none"
                  >
                    {resolvedTheme === 'dark' ? <Sun className="w-4 h-4 opacity-40 group-aria-selected:opacity-100" /> : <Moon className="w-4 h-4 opacity-40 group-aria-selected:opacity-100" />}
                    <span className="text-sm font-medium">Toggle {resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode</span>
                    <span className="ml-auto text-[10px] font-sans px-2 py-0.5 rounded-full bg-foreground/5 opacity-40">T</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => {
                      navigator.clipboard.writeText('DylanSkinner65@gmail.com');
                      alert('Email copied to clipboard!');
                    })}
                    className="flex items-center gap-4 px-4 py-3 rounded-lg cursor-pointer aria-selected:bg-accent-soft aria-selected:text-accent group transition-colors select-none"
                  >
                    <Mail className="w-4 h-4 opacity-40 group-aria-selected:opacity-100" />
                    <span className="text-sm font-medium">Copy Email</span>
                    <span className="ml-auto text-[10px] font-sans px-2 py-0.5 rounded-full bg-foreground/5 opacity-40">E</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => {
                      window.open('/Dylan Skinner - Resume (Website - 21 Jan).pdf', '_blank');
                    })}
                    className="flex items-center gap-4 px-4 py-3 rounded-lg cursor-pointer aria-selected:bg-accent-soft aria-selected:text-accent group transition-colors select-none"
                  >
                    <Download className="w-4 h-4 opacity-40 group-aria-selected:opacity-100" />
                    <span className="text-sm font-medium">Download Resume</span>
                    <span className="ml-auto text-[10px] font-sans px-2 py-0.5 rounded-full bg-foreground/5 opacity-40">R</span>
                  </Command.Item>
                </Command.Group>
              </Command.List>

              <div className="px-6 py-4 border-t border-foreground/5 bg-foreground/[0.02] flex items-center justify-between">
                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest opacity-20 italic">
                  <span>COMMAND CENTER v2.0</span>
                </div>
                <div className="flex items-center gap-4 text-[8px] font-bold opacity-40">
                   <div className="flex items-center gap-3">
                     <div className="flex items-center gap-1">
                       <span className="border border-foreground/10 px-1.5 py-0.5 rounded bg-background">↑↓</span>
                       <span>NAVIGATE</span>
                     </div>
                     <div className="flex items-center gap-1">
                       <span className="border border-foreground/10 px-1.5 py-0.5 rounded bg-background">ENTER</span>
                       <span>SELECT</span>
                     </div>
                     <div className="flex items-center gap-1">
                       <span className="border border-foreground/10 px-1.5 py-0.5 rounded bg-background">ESC</span>
                       <span>CLOSE</span>
                     </div>
                   </div>
                </div>
              </div>
            </Command>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
