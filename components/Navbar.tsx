import React, { useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Sun, Moon, Download } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export const Navbar: React.FC = () => {
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();
  const { theme, toggleTheme } = useTheme();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  const scrollToSection = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string
  ) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // Match scroll-padding-top
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <motion.nav
      variants={{
        visible: { y: 0 },
        hidden: { y: -100 },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-6 pointer-events-none"
    >
      <div className="pointer-events-auto bg-white/80 dark:bg-[#121212]/80 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-full px-6 md:px-8 py-3 flex items-center gap-8 shadow-2xl transition-all duration-300">
        <a
          href="#home"
          onClick={(e) => scrollToSection(e, "home")}
          className="font-bold text-lg tracking-tighter text-gray-900 dark:text-white hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
        >
          UA.
        </a>

        <div className="hidden md:flex items-center gap-8 font-mono text-sm">
          <NavLink href="#about" onClick={(e) => scrollToSection(e, "about")}>
            About
          </NavLink>
          <NavLink href="#skills" onClick={(e) => scrollToSection(e, "skills")}>
            Stack
          </NavLink>
          <NavLink
            href="#projects"
            onClick={(e) => scrollToSection(e, "projects")}
          >
            Projects
          </NavLink>
          <NavLink
            href="#articles"
            onClick={(e) => scrollToSection(e, "articles")}
          >
            Articles
          </NavLink>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={toggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20 transition-all"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          <a
            href="https://drive.google.com/uc?export=download&id=147-Gf5QhZBJ_psUhIE_Y5DXAVuFDqMDQ"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-full border border-black/5 dark:border-white/10 bg-transparent hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-sm font-medium text-gray-900 dark:text-white group"
            aria-label="Download CV"
            onClick={(e) => e.preventDefault()} // Placeholder - add real link here
          >
            <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
            <span className="hidden sm:block">CV</span>
          </a>

          <a
            href="#projects"
            onClick={(e) => scrollToSection(e, "projects")}
            className="bg-gray-900 dark:bg-white text-white dark:text-black px-4 md:px-5 py-2 rounded-full text-xs md:text-sm font-bold hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors flex items-center gap-2 cursor-pointer"
          >
            Work
            <span className="bg-white dark:bg-black text-black dark:text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
              →
            </span>
          </a>
        </div>
      </div>
    </motion.nav>
  );
};

const NavLink: React.FC<{
  href: string;
  onClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  children: React.ReactNode;
}> = ({ href, onClick, children }) => (
  <a
    href={href}
    onClick={onClick}
    className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors relative group"
  >
    {children}
    <span className="absolute -bottom-1 left-0 w-full h-px bg-black dark:bg-white origin-center scale-x-0 opacity-0 transition-all duration-300 ease-out group-hover:scale-x-100 group-hover:opacity-100"></span>
  </a>
);
