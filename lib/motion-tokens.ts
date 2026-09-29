import type { Transition, Variants } from 'framer-motion';

type CubicBezier = [number, number, number, number];

/**
 * Central motion tokens — every animation value in the app comes from here.
 * Source: motion-foundations skill (durations, easings, distances, scales).
 */
export const motionTokens = {
  duration: {
    instant: 0.08,
    fast: 0.18,
    normal: 0.35,
    slow: 0.6,
    crawl: 1.0,
  },
  easing: {
    smooth: [0.22, 1, 0.36, 1] as CubicBezier,
    sharp: [0.4, 0, 0.2, 1] as CubicBezier,
    bounce: [0.34, 1.56, 0.64, 1] as CubicBezier,
    linear: [0, 0, 1, 1] as CubicBezier,
  },
  distance: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 48,
  },
  scale: {
    subtle: 0.98,
    press: 0.95,
    pop: 1.04,
  },
  /** Stagger interval must stay between 0.05s and 0.10s (motion-patterns rule 5). */
  stagger: {
    fast: 0.05,
    normal: 0.08,
    slow: 0.1,
  },
} as const;

export const springs: Record<'snappy' | 'gentle' | 'bouncy' | 'instant' | 'release' | 'track', Transition> = {
  snappy: { type: 'spring', stiffness: 300, damping: 30 },
  gentle: { type: 'spring', stiffness: 120, damping: 14 },
  bouncy: { type: 'spring', stiffness: 400, damping: 10 },
  instant: { type: 'spring', stiffness: 600, damping: 35 },
  release: { type: 'spring', stiffness: 200, damping: 20, restDelta: 0.001 },
  /* Fast, critically-damped trail — for the cursor ring (no overshoot, no lag). */
  track: { type: 'spring', stiffness: 650, damping: 40, mass: 0.6, restDelta: 0.2 },
};

/** Container variant: parent must set `initial="hidden" animate="visible"`. */
export const staggerContainer = (
  stagger: number = motionTokens.stagger.normal,
  delayChildren = 0
): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren },
  },
});

/** Default item variant revealed by `staggerContainer`. */
export const fadeUpItem: Variants = {
  hidden: { opacity: 0, y: motionTokens.distance.lg },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: motionTokens.duration.slow,
      ease: motionTokens.easing.smooth,
    },
  },
};

/** Compact item variant — for tight lists (achievements, chips). */
export const fadeSideItem: Variants = {
  hidden: { opacity: 0, x: -motionTokens.distance.sm },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: motionTokens.duration.normal,
      ease: motionTokens.easing.smooth,
    },
  },
};
