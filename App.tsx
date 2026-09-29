import { useEffect } from "react";
import Lenis from "lenis";
import { MotionConfig } from "framer-motion";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { About } from "./components/About";
import { Skills } from "./components/Skills";
import { Experience } from "./components/Experience";
import { Projects } from "./components/Projects";
import { Footer } from "./components/Footer";
import { ThemeProvider } from "./context/ThemeContext";
import { Cursor } from "./components/ui/Cursor";

function AppContent() {
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis: Lenis | null = null;

    const setup = () => {
      if (mq.matches) {
        lenis?.destroy();
        lenis = null;
        return;
      }
      if (lenis) return;
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
        autoRaf: true,
        anchors: { offset: -100 },
      });
    };

    setup();
    mq.addEventListener("change", setup);

    return () => {
      mq.removeEventListener("change", setup);
      lenis?.destroy();
      lenis = null;
    };
  }, []);

  return (
    <div className="bg-[var(--color-bg)] min-h-screen text-gray-900 dark:text-white transition-colors duration-500">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Cursor />
      <Navbar />
      <main id="main" tabIndex={-1}>
        <Hero />
        <About />
        <Skills />
        <Experience />
        <Projects />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <MotionConfig reducedMotion="user">
        <AppContent />
      </MotionConfig>
    </ThemeProvider>
  );
}

export default App;
