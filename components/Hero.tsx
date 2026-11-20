import React, { useEffect, useState } from 'react';
import {
  motion,
  animate,
  useMotionValue,
  useSpring,
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
  Monitor,
  Server,
  Database,
  ShieldCheck,
  Code2,
  type LucideIcon,
} from 'lucide-react';
import { motionTokens, springs } from '../lib/motion-tokens';

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

/**
 * The four seams of the architecture Umair actually ships. The ring is the
 * request path; the travelling dash is a request moving through it.
 */
const DIAGRAM_NODES: {
  icon: LucideIcon;
  label: string;
  sub: string;
  angle: number;
}[] = [
  { icon: Monitor, label: 'Client', sub: 'Next.js · React', angle: -90 },
  { icon: Server, label: 'API', sub: 'Nest.js · REST', angle: 0 },
  { icon: Database, label: 'Database', sub: 'PostgreSQL · Prisma', angle: 90 },
  { icon: ShieldCheck, label: 'Auth', sub: 'RBAC · Sessions', angle: 180 },
];

const NAME = 'Umair Ahsan';

const RING_RADIUS_PCT = 33;
/* Ring radius in viewBox units (the diagram uses a 100×100 viewBox). */
const RING_RADIUS = 34;
/* Counter-rotating dashed ring, drawn as a bordered div so the rotation is a
   plain CSS transform rather than an SVG transform-origin gamble. */
const INNER_RADIUS = 23;
/** Polar → percentage position inside a square container. */
const polar = (angleDeg: number) => {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    left: `${50 + RING_RADIUS_PCT * Math.cos(rad)}%`,
    top: `${50 + RING_RADIUS_PCT * Math.sin(rad)}%`,
  };
};

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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-100/50 via-gray-50 to-gray-50 dark:from-blue-900/20 dark:via-[var(--color-deep)] dark:to-[var(--color-deep)] transition-colors duration-500"></div>
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
              Full-Stack Engineer
            </motion.p>

            <motion.p
              variants={fadeItem}
              className="text-gray-600 dark:text-gray-400 text-base md:text-lg max-w-lg leading-relaxed mb-8 theme-transition"
            >
              I build enterprise platforms end to end — typed APIs, role-based access,
              real-time data, and the dashboards on top. Shipped for aviation, healthcare,
              and CRM teams.
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

          <SystemDiagram />
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

/**
 * Circular architecture diagram. Keeps the real stack (client / API / database
 * / auth) as the content, but carries the visual weight of the old orb: an
 * accent glow, a counter-rotating inner ring, a breathing core, and a pointer
 * tilt. The dot travelling the ring is a request moving through the system.
 */
const SystemDiagram: React.FC = () => {
  const reduce = useReducedMotion();
  const packetAngle = useMotionValue(0);
  const tiltX = useSpring(0, springs.release);
  const tiltY = useSpring(0, springs.release);

  useEffect(() => {
    if (reduce) return;
    const controls = animate(packetAngle, 360, {
      duration: 6,
      repeat: Infinity,
      ease: 'linear',
    });
    return () => controls.stop();
  }, [reduce, packetAngle]);

  /* Subtle tilt toward the pointer. Matches the old orb, at a much lower
     amplitude so it reads as depth rather than as a moving target. */
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduce) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    tiltY.set(((e.clientX - left) / width - 0.5) * 8);
    tiltX.set(((e.clientY - top) / height - 0.5) * -8);
  };

  const resetTilt = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  /* Ring positions in viewBox units. The -90° offset starts the packet at
     12 o'clock, so it leaves the Client node first. */
  const ringX = (offset: number) => (a: number) =>
    50 + RING_RADIUS * Math.cos(((a + offset) * Math.PI) / 180);
  const ringY = (offset: number) => (a: number) =>
    50 + RING_RADIUS * Math.sin(((a + offset) * Math.PI) / 180);

  const packetX = useTransform(packetAngle, ringX(-90));
  const packetY = useTransform(packetAngle, ringY(-90));
  const trailX = useTransform(packetAngle, ringX(-106));
  const trailY = useTransform(packetAngle, ringY(-106));

  return (
    <motion.div
      initial={{ opacity: 0, scale: motionTokens.scale.subtle }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: motionTokens.duration.crawl, ease: motionTokens.easing.smooth, delay: motionTokens.duration.normal }}
      onPointerMove={onPointerMove}
      onPointerLeave={resetTilt}
      style={{ rotateX: tiltX, rotateY: tiltY }}
      className="relative w-full max-w-[190px] sm:max-w-[360px] lg:max-w-[440px] mx-auto aspect-square [perspective:1000px]"
      role="img"
      aria-label="System architecture: a Next.js and React client, a Nest.js REST API, PostgreSQL with Prisma, and RBAC auth, connected by shared TypeScript types."
    >
      {/* Accent glow — gives the diagram presence against the flat grid.
          Kept fainter in light, where a full-strength wash smudges the page. */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] aspect-square rounded-full bg-[var(--color-accent)] opacity-[0.05] dark:opacity-[0.09] blur-3xl z-0 pointer-events-none"
        aria-hidden="true"
      />

      {/* Connection ring + travelling request packet */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full z-10" aria-hidden="true">
        <defs>
          <filter id="packet-glow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="1.1" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle
          cx="50"
          cy="50"
          r={RING_RADIUS}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
        {!reduce && (
          <>
            <motion.circle r="1.1" fill="var(--color-accent)" fillOpacity="0.3" cx={trailX} cy={trailY} />
            <motion.circle r="1.8" fill="var(--color-accent)" cx={packetX} cy={packetY} filter="url(#packet-glow)" />
          </>
        )}
      </svg>

      {/* Counter-rotating inner ring — the orbit mechanic, at low amplitude */}
      <motion.div
        className="absolute rounded-full border border-dashed border-[var(--color-border)] pointer-events-none z-10"
        style={{
          width: `${INNER_RADIUS * 2}%`,
          height: `${INNER_RADIUS * 2}%`,
          left: `${50 - INNER_RADIUS}%`,
          top: `${50 - INNER_RADIUS}%`,
        }}
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ duration: 34, repeat: Infinity, ease: 'linear' }}
        aria-hidden="true"
      />

      {/* Core glow — breathes behind the shared-types node */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[27%] aspect-square rounded-full bg-[var(--color-accent)] blur-2xl z-10"
        animate={reduce ? undefined : { opacity: [0.14, 0.32, 0.14], scale: [0.94, 1.12, 0.94] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden="true"
      />

      {/* Core — the shared contract every layer depends on */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-[27%] aspect-square rounded-full bg-[var(--color-deep)] border border-[var(--color-border)] flex flex-col items-center justify-center theme-transition"
        aria-hidden="true"
      >
        <Code2 className="w-6 h-6 text-[var(--color-accent)] sm:mb-1.5" />
        <span className="font-mono text-[10px] md:text-xs font-semibold text-gray-900 dark:text-white hidden sm:block">
          TypeScript
        </span>
        <span className="font-mono text-[9px] md:text-[10px] text-gray-500 hidden sm:block">
          shared types
        </span>
      </div>

      {/* Architecture nodes */}
      {DIAGRAM_NODES.map((node, i) => (
        <motion.div
          key={node.label}
          initial={{ opacity: 0, scale: motionTokens.scale.subtle }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...springs.gentle, delay: motionTokens.duration.slow + i * motionTokens.stagger.slow }}
          style={polar(node.angle)}
          className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 md:gap-2 z-30"
          aria-hidden="true"
        >
          <div className="surface w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center text-gray-700 dark:text-gray-300 shadow-md hover:border-[var(--color-border-hover)] hover:shadow-lg">
            <node.icon className="w-5 h-5" />
          </div>
          <div className="text-center hidden sm:block">
            <div className="font-mono text-[10px] uppercase tracking-wider text-gray-900 dark:text-gray-100">
              {node.label}
            </div>
            <div className="font-mono text-[10px] text-gray-500 whitespace-nowrap">{node.sub}</div>
          </div>
        </motion.div>
      ))}
    </motion.div>
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
