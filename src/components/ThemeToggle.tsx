import { motion } from 'framer-motion';
import { useTheme } from '../hooks/ThemeContext';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-foreground/5 transition-colors group"
      aria-label="Toggle theme"
    >
      <div className="relative w-5 h-5">
        <motion.svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          animate={{
            rotate: resolvedTheme === 'dark' ? 180 : 0,
          }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Sun rays */}
          <motion.g
            animate={{
              opacity: resolvedTheme === 'dark' ? 0 : 1,
              scale: resolvedTheme === 'dark' ? 0.5 : 1,
            }}
          >
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
              <line
                key={angle}
                x1="10"
                y1="3"
                x2="10"
                y2="1"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                transform={`rotate(${angle} 10 10)`}
              />
            ))}
          </motion.g>

          {/* Core circle (Sun/Moon) */}
          <motion.circle
            cx="10"
            cy="10"
            r={resolvedTheme === 'dark' ? 7 : 5}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            animate={{
              r: resolvedTheme === 'dark' ? 7 : 5,
            }}
          />

          {/* Moon eclipse mask */}
          <motion.circle
            cx="14"
            cy="6"
            r="6"
            fill="var(--background)"
            animate={{
              cx: resolvedTheme === 'dark' ? 14 : 25,
              cy: resolvedTheme === 'dark' ? 6 : -5,
              opacity: resolvedTheme === 'dark' ? 1 : 0,
            }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          />
        </motion.svg>
      </div>
      
      {/* Tooltip hint */}
      <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase tracking-tighter opacity-0 group-hover:opacity-40 transition-opacity whitespace-nowrap">
        TOGGLE THEME (T)
      </span>
    </button>
  );
}
