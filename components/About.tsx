import React from 'react';
import { motion } from 'framer-motion';
import { Section, SectionTitle } from './ui/Section';
import { motionTokens, fadeUpItem } from '../lib/motion-tokens';

const imageReveal = {
  hidden: { opacity: 0, scale: motionTokens.scale.subtle },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: motionTokens.duration.slow, ease: motionTokens.easing.smooth },
  },
} as const;

export const About: React.FC = () => {
  return (
    <Section id="about" className="py-12 md:py-16">
      <SectionTitle subtitle="About me">Who I Am</SectionTitle>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start relative">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUpItem}
        >
          <h3 className="font-display text-xl md:text-2xl lg:text-3xl font-normal leading-snug mb-4 md:mb-6 text-gray-800 dark:text-gray-100 theme-transition">
            Hello! I'm Umair. I'm a <span className="font-bold text-black dark:text-white">Backend &amp; AI-Integrated Apps Engineer</span> building scalable APIs, enterprise platforms, and LLM-powered products.
          </h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6 transition-colors duration-500">
            I specialize in crafting robust, scalable, and high-performance web applications using Java/Spring Boot, Nest.js, PostgreSQL, Redis, and TypeScript, with Next.js and React on the front end.
          </p>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6 transition-colors duration-500">
            My strengths include designing clean architectures, developing efficient APIs, implementing authentication/RBAC, building UI/UX with smooth animations, and delivering production-ready, maintainable code.
          </p>
        </motion.div>

        {/* Mobile image - below text, no negative margins */}
        <div className="md:hidden mt-0">
          <motion.div
            className="relative max-w-[280px] mx-auto mb-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={imageReveal}
          >
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-xl aspect-[3/4]">
              <img
                src="/projects/umair.webp"
                alt="Umair Ahsan"
                width={280}
                height={373}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover object-top"
              />

              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 dark:from-[var(--color-bg)] via-transparent to-transparent opacity-50" aria-hidden="true"></div>
            </div>

            {/* Decorative Backdrops */}
            <div className="absolute -top-4 -right-4 w-full h-full border border-[var(--color-border)] rounded-2xl -z-10 theme-transition" aria-hidden="true"></div>
          </motion.div>
        </div>

        {/* Desktop image */}
        <motion.div
          className="hidden md:block relative w-full max-w-[320px] lg:max-w-[360px] justify-self-end md:-mt-36 lg:-mt-40"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={imageReveal}
        >
          <div className="relative z-10 rounded-2xl overflow-hidden grayscale hover:grayscale-0 transition-[filter] duration-500 shadow-xl aspect-[3/4]">
            <img
              src="/projects/umair.webp"
              alt="Umair Ahsan"
              width={360}
              height={480}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover object-top"
            />

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 dark:from-[var(--color-bg)] via-transparent to-transparent opacity-60" aria-hidden="true"></div>
          </div>

          {/* Decorative Backdrops */}
          <div className="absolute -top-4 -right-4 w-full h-full border border-[var(--color-border-hover)] rounded-2xl -z-10 transition-colors duration-500" aria-hidden="true"></div>
        </motion.div>
        {/* Full-width row: keeps the left column and the photo the same height */}
        <motion.div
          className="md:col-span-2"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUpItem}
        >
          <div className="surface overflow-hidden font-mono text-xs sm:text-sm">
            <div className="px-4 py-2 border-b border-[var(--color-border)] bg-[var(--color-elevated)] text-gray-500">
              profile.json
            </div>
            <dl className="px-4 py-4 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-2 leading-relaxed">
              {[
                ['role', 'Backend & AI-Integrated Apps Engineer'],
                ['focus', 'REST APIs, RBAC, caching, LLM integrations'],
                ['stack', 'Spring Boot · Nest.js · PostgreSQL · Redis'],
                ['langs', 'Java, TypeScript, JavaScript, Python, C, C++, SQL'],
                ['base', 'Karachi, Pakistan'],
                ['work', 'Remote · Relocation available'],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-3 min-w-0">
                  <dt className="w-12 shrink-0 text-[var(--color-accent)]">{k}</dt>
                  <dd className="text-gray-700 dark:text-gray-300">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </motion.div>
      </div>
    </Section>
  );
};
