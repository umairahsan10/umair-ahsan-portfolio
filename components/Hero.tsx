import React, { useState } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  useMotionValueEvent,
  type Variants,
} from 'framer-motion';
import {
  Github,
  Linkedin,
  Mail,
  ArrowRight,
  ArrowDown,
} from 'lucide-react';
import { motionTokens } from '../lib/motion-tokens';
import { RequestLog } from './ui/RequestLog';

/* Text block choreography: identity → name → role → claim → actions */
const textContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: motionTokens.stagger.normal,
      delayChildren: motionTokens.duration.fast,
    },
  },
};

const fadeItem: Variants = {
  hidden: { opacity: 0, y: motionTokens.distance.lg },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: motionTokens.duration.slow, ease: motionTokens.easing.smooth },
  },
};

/**
 * Gate for the name. Empty on purpose: the heading occupies a single stagger
 * slot in `textContainer`, and the per-character timing is driven by `charItem`
 * below. If this declared `staggerChildren`, all eleven characters would each
 * consume a slot and the name alone would take ~0.9s to finish.
 */
const nameBlock: Variants = { hidden: {}, visible: {} };

/**
 * Per-character masked reveal — the effect GSAP SplitText is bought for.
 * Each glyph rises out of the name's overflow mask, offset by its own index.
 * `reduce` collapses it to a single opacity fade with no stagger, because
 * `filter`/transform suppression alone would still leave the timing offset.
 */
const charItem: Variants = {
  hidden: { y: '110%', opacity: 0 },
  visible: ({ i, reduce }: { i: number; reduce: boolean }) => ({
    y: '0%',
    opacity: 1,
    transition: {
      duration: reduce ? motionTokens.duration.fast : motionTokens.duration.normal,
      ease: motionTokens.easing.smooth,
      delay: reduce ? 0 : i * 0.03,
    },
  }),
};

const NAME = 'Umair Ahsan';

export const Hero: React.FC = () => {
  const { scrollY } = useScroll();
  const reduce = useReducedMotion();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const [fadedOut, setFadedOut] = useState(false);

  /* Once the hero has faded out, remove its links from the tab order */
  useMotionValueEvent(scrollY, 'change', (latest) => {
    const faded = latest > 320;
    setFadedOut((prev) => (prev === faded ? prev : faded));
  });

  return (
    <section
      id="home"
      className="min-h-screen flex flex-col relative overflow-hidden pt-16 xl:pt-32 pb-16 xl:pb-32 transition-colors duration-500"
    >
      {/* Background — the original radial wash, restored at the user's request */}
      <div className="absolute inset-0 bg-[var(--color-deep)] z-0 theme-transition" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_50%,var(--color-accent-wash),transparent_60%)] transition-colors duration-500"></div>
        <div className="absolute inset-0 opacity-[0.35] dark:opacity-[0.5] [background-image:linear-gradient(var(--color-border)_1px,transparent_1px),linear-gradient(90deg,var(--color-border)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-black/5 dark:via-white/5 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-black/5 dark:via-white/5 to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full flex-grow flex flex-col justify-center">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16 items-center">

          {/* Left: identity + typography + actions */}
          <motion.div
            style={{ opacity }}
            variants={textContainer}
            initial="hidden"
            animate="visible"
            className="flex flex-col z-20"
            inert={fadedOut}
            aria-hidden={fadedOut}
          >
            {/* Identity row — avatar + live status */}
            <motion.div variants={fadeItem} className="flex items-center gap-3 mb-7">
              <img
                src="/projects/umair.webp"
                alt=""
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover object-top ring-1 ring-[var(--color-border)]"
              />
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-success)] opacity-60"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-success)]"></span>
              </span>
              <span className="font-mono text-xs text-[var(--color-success)] tracking-wider font-semibold uppercase">
                Available for hire
              </span>
            </motion.div>

            {/*
              Max size is 72px, not 96px. In a two-column grid the left column
              is only ~560px wide, and the name needs ~400px at 72px — enough
              headroom that it cannot wrap. The two-column split is therefore
              held back to `xl` (1280px); at `lg` the hero is single-column, so
              the name always has the full content width to itself.
            */}
            <motion.h1
              variants={nameBlock}
              className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.02] mb-3 text-gray-900 dark:text-white"
            >
              {/* Splitting the name into per-glyph spans destroys the accessible
                  text, so the real string is kept here and the visual copy hidden. */}
              <span className="sr-only">{NAME}</span>
              <span className="block overflow-hidden whitespace-nowrap" aria-hidden="true">
                {NAME.split('').map((ch, i) =>
                  ch === ' ' ? (
                    <span key={i} className="inline-block">
                      &nbsp;
                    </span>
                  ) : (
                    <motion.span
                      key={i}
                      variants={charItem}
                      custom={{ i, reduce: !!reduce }}
                      className="inline-block"
                    >
                      {ch}
                    </motion.span>
                  )
                )}
              </span>
            </motion.h1>

            <motion.p
              variants={fadeItem}
              className="font-mono text-sm md:text-base text-[var(--color-accent)] tracking-wider uppercase mb-6"
            >
              Backend &amp; AI-Integrated Apps Engineer
            </motion.p>

            <motion.p
              variants={fadeItem}
              className="text-gray-600 dark:text-gray-400 text-base md:text-lg max-w-lg leading-relaxed mb-8 theme-transition"
            >
              I design the backend that keeps enterprise platforms fast and safe — typed
              APIs, role-based access, caching, and LLM pipelines. Shipped for aviation,
              healthcare, and CRM teams.
            </motion.p>

            <motion.div variants={fadeItem} className="flex flex-wrap items-center gap-3 mb-8">
              <a
                href="mailto:umairahsan2019@gmail.com"
                className="group inline-flex items-center gap-2 min-h-[48px] px-6 rounded-full bg-gray-900 dark:bg-white text-white dark:text-black font-medium text-sm hover:bg-[var(--color-accent)] dark:hover:bg-[var(--color-accent)] dark:hover:text-white active:scale-[0.97] transition-[background-color,color,transform] duration-150 ease-out cursor-pointer"
              >
                Get in touch
                <ArrowRight
                  className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-150 ease-out"
                  aria-hidden="true"
                />
              </a>
              <a
                href="#projects"
                className="group inline-flex items-center gap-2 min-h-[48px] px-6 rounded-full border border-[var(--color-border)] text-gray-900 dark:text-white font-medium text-sm hover:border-[var(--color-border-hover)] hover:bg-black/[0.03] dark:hover:bg-white/[0.04] active:scale-[0.97] transition-[background-color,border-color,transform] duration-150 ease-out cursor-pointer"
              >
                View work
                <ArrowDown
                  className="w-4 h-4 group-hover:translate-y-0.5 transition-transform duration-150 ease-out"
                  aria-hidden="true"
                />
              </a>
            </motion.div>

            <motion.div variants={fadeItem} className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <SocialLink href="https://github.com/umairahsan10" icon={Github} label="GitHub" />
              <SocialLink href="https://linkedin.com/in/umair-ahsan-650315250" icon={Linkedin} label="LinkedIn" />
              <SocialLink href="mailto:umairahsan2019@gmail.com" icon={Mail} label="Email" />
            </motion.div>
          </motion.div>

          <RequestLog />
        </div>

        {/* Scroll cue — a real link, not decoration. Suppressed on short
            viewports, where the vertically-centred content would reach into it. */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:block [@media(max-height:880px)]:hidden">
          <a
            href="#about"
            className="group flex flex-col items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors duration-150 ease-out cursor-pointer"
          >
            <span className="text-[10px] uppercase tracking-[0.2em] font-mono">Scroll</span>
            <span
              className="w-px h-8 bg-gradient-to-b from-current to-transparent"
              aria-hidden="true"
            />
          </a>
        </div>
      </div>
    </section>
  );
};

const SocialLink: React.FC<{
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
  href: string;
  label: string;
}> = ({ icon: Icon, href, label }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="group inline-flex items-center gap-2 font-mono text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors duration-150 ease-out cursor-pointer"
  >
    <Icon className="w-4 h-4" aria-hidden={true} />
    {label}
  </a>
);
