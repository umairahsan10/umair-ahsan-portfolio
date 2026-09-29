import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { motionTokens, staggerContainer, fadeUpItem, fadeSideItem } from '../../lib/motion-tokens';

interface SectionProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
}

/**
 * Stagger container — wraps a group of `StaggerItem`s and reveals them in
 * sequence when scrolled into view. Reveal happens once (motion-patterns rule 7).
 */
export const StaggerGroup: React.FC<{
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  delayChildren?: number;
}> = ({ children, className, stagger = motionTokens.stagger.normal, delayChildren = 0 }) => (
  <motion.div
    className={className}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: '-80px' }}
    variants={staggerContainer(stagger, delayChildren)}
  >
    {children}
  </motion.div>
);

/** Staggered child — must be inside a `StaggerGroup` (or any animating parent). */
export const StaggerItem: React.FC<{
  children: React.ReactNode;
  className?: string;
  variant?: 'up' | 'side';
}> = ({ children, className, variant = 'up' }) => (
  <motion.div
    className={className}
    variants={variant === 'side' ? fadeSideItem : fadeUpItem}
  >
    {children}
  </motion.div>
);

export const Section: React.FC<SectionProps> = ({ children, id, className = '' }) => {
  return (
    <section id={id} className={`py-12 md:py-16 px-6 md:px-12 max-w-7xl mx-auto relative ${className}`}>
      {children}
    </section>
  );
};

export const SectionTitle: React.FC<{ children: React.ReactNode; subtitle?: string }> = ({ children, subtitle }) => {
  const titleVariants: Variants = {
    hidden: { opacity: 0, y: motionTokens.distance.lg },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: motionTokens.duration.normal, ease: motionTokens.easing.smooth },
    },
  };

  return (
    <div className="mb-12">
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, x: -motionTokens.distance.md }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: motionTokens.duration.normal, ease: motionTokens.easing.smooth }}
          className="font-mono text-[var(--color-accent)] mb-4 text-sm tracking-wider uppercase transition-colors duration-500"
        >
          // {subtitle}
        </motion.p>
      )}
      <motion.h2
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={titleVariants}
        className="text-4xl md:text-6xl font-bold tracking-tighter"
      >
        {children}
      </motion.h2>
    </div>
  );
};
