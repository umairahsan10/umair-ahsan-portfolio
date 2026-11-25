import React, { createContext, useContext, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  /** Pass the click point to start the circular wipe there. */
  toggleTheme: (origin?: { x: number; y: number }) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const getPreferredTheme = (): Theme => {
  const stored = window.localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark') return stored;
  /* Dark-first: the terminal aesthetic is the brand. Light is opt-in via the toggle. */
  return 'dark';
};

const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
  root.style.colorScheme = theme;
  window.localStorage.setItem('theme', theme);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#08090a' : '#f9fafb');
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() =>
    typeof window === 'undefined' ? 'dark' : getPreferredTheme()
  );

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  /* Sync theme changes across browser tabs */
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'theme' && (e.newValue === 'light' || e.newValue === 'dark')) {
        setTheme(e.newValue);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  /*
   * Circular wipe: the View Transitions API snapshots the old page, the new
   * theme is applied synchronously, and the new snapshot is revealed through
   * a growing circle from the click point. Colour transitions are suspended
   * during the switch so the new snapshot is captured in its final colours.
   * Falls back to an instant switch without API support or with reduced motion.
   */
  const toggleTheme = (origin?: { x: number; y: number }) => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => { ready: Promise<void>; finished: Promise<void> };
    };
    if (!doc.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTheme(next);
      return;
    }
    const x = origin?.x ?? window.innerWidth - 48;
    const y = origin?.y ?? 48;
    const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    const root = document.documentElement;
    root.classList.add('theme-switching');
    const t = doc.startViewTransition(() => {
      flushSync(() => setTheme(next));
      applyTheme(next);
    });
    t.ready
      .then(() => {
        root.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
          { duration: 650, easing: 'cubic-bezier(0.7, 0, 0.3, 1)', pseudoElement: '::view-transition-new(root)' },
        );
      })
      .catch(() => {});
    t.finished.finally(() => root.classList.remove('theme-switching'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
