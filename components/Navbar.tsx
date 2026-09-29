import React, { useEffect, useState } from "react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { Sun, Moon, Download, Menu, X } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { springs } from "../lib/motion-tokens";

const NAV_SECTIONS = [
  { id: "about", label: "About" },
  { id: "skills", label: "Stack" },
  { id: "projects", label: "Projects" },
] as const;

export const Navbar: React.FC = () => {
  const [hidden, setHidden] = useState(false);
  const [active, setActive] = useState<string>("");
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY, scrollYProgress } = useScroll();
  const { theme, toggleTheme } = useTheme();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150) {
      setHidden(true);
      setMenuOpen(false);
    } else {
      setHidden(false);
    }
  });

  /* Scrollspy: highlight the section currently in the middle of the viewport */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    NAV_SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <>
      {/* Scroll progress bar */}
      <motion.div
        style={{ scaleX: scrollYProgress }}
        className="fixed top-0 left-0 right-0 h-[2px] origin-left bg-gradient-to-r from-blue-500 via-blue-400 to-purple-500 z-[60] pointer-events-none"
        aria-hidden="true"
      />

      <motion.nav
        variants={{
          visible: { y: 0 },
          hidden: { y: -110 },
        }}
        animate={hidden ? "hidden" : "visible"}
        transition={springs.snappy}
        className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center pt-6 px-6 pointer-events-none"
        aria-label="Main navigation"
        inert={hidden}
      >
        <div className="pointer-events-auto bg-[var(--color-pill)] backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-full px-5 md:px-8 py-3 flex items-center gap-5 md:gap-8 shadow-2xl transition-colors duration-300">
          <a
            href="#home"
            className="font-bold text-lg tracking-tighter text-gray-900 dark:text-white hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
          >
            UA.
          </a>

          <div className="hidden md:flex items-center gap-8 font-mono text-sm">
            {NAV_SECTIONS.map(({ id, label }) => (
              <NavLink key={id} href={`#${id}`} active={active === id}>
                {label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={toggleTheme}
              className="w-11 h-11 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20 active:scale-95 transition-colors cursor-pointer"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
              aria-pressed={theme === "dark"}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Moon className="w-4 h-4" aria-hidden="true" />
              )}
            </button>

            <a
              href="/resume.pdf"
              download="Umair_Ahsan_Resume.pdf"
              className="flex items-center justify-center gap-2 px-3 md:px-4 min-h-[44px] rounded-full border border-black/5 dark:border-white/10 bg-transparent hover:bg-gray-100 dark:hover:bg-white/5 active:scale-95 transition-[background-color,transform] text-sm font-medium text-gray-900 dark:text-white group cursor-pointer"
              aria-label="Download CV"
            >
              <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" aria-hidden="true" />
              <span className="hidden sm:block">CV</span>
            </a>

            <a
              href="#projects"
              className="bg-gray-900 dark:bg-white text-white dark:text-black px-4 md:px-5 py-2 rounded-full text-xs md:text-sm font-bold hover:bg-blue-600 dark:hover:bg-blue-600 dark:hover:text-white hover:shadow-lg hover:shadow-blue-500/25 active:scale-95 transition-[background-color,color,transform,box-shadow] hidden sm:flex items-center gap-2 cursor-pointer"
            >
              Work
              <span className="bg-white dark:bg-black text-black dark:text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]" aria-hidden="true">
                →
              </span>
            </a>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="md:hidden w-11 h-11 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20 active:scale-95 transition-colors cursor-pointer"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              {menuOpen ? (
                <X className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              id="mobile-menu"
              key="mobile-menu"
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={springs.snappy}
              className="md:hidden pointer-events-auto mt-3 w-full max-w-[320px] rounded-3xl bg-[var(--color-pill)] backdrop-blur-xl border border-black/5 dark:border-white/10 p-3 flex flex-col shadow-2xl"
            >
              {NAV_SECTIONS.map(({ id, label }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  onClick={() => setMenuOpen(false)}
                  className={`font-mono text-sm px-4 py-3 rounded-2xl transition-colors cursor-pointer ${
                    active === id
                      ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  {label}
                </a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
};

const NavLink: React.FC<{
  href: string;
  active?: boolean;
  children: React.ReactNode;
}> = ({ href, active = false, children }) => (
  <a
    href={href}
    className={`transition-colors relative group cursor-pointer ${
      active
        ? "text-black dark:text-white"
        : "text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
    }`}
    aria-current={active ? "true" : undefined}
  >
    {children}
    <span
      className={`absolute -bottom-1 left-0 w-full h-px bg-black dark:bg-white origin-center transition-[transform,opacity] duration-300 ease-out ${
        active ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100"
      }`}
      aria-hidden="true"
    ></span>
  </a>
);
