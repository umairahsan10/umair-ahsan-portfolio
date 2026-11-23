import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { Section, SectionTitle } from './ui/Section';
import { Experience as ExperienceType } from '../types';
import { Briefcase, Calendar } from 'lucide-react';
import { motionTokens, fadeSideItem } from '../lib/motion-tokens';

/*
 * NOTE — outstanding content work:
 * These achievements describe responsibilities, not results, and none of them
 * carry a number. Quantified outcomes (requests/day, p95 latency, rows migrated,
 * team size, uptime, cost saved) are the single highest-value change still
 * available on this page. No figures have been invented here on purpose —
 * add only numbers that can be defended in an interview.
 */
const experiences: ExperienceType[] = [
  {
    id: 1,
    period: 'June 2026 - Present',
    company: 'Moavin Technologies',
    role: 'Software Engineer',
    stack: 'Spring Boot, MySQL, Redis, Docker, REST APIs',
    achievements: [
      'Build and maintain scalable backend services in Spring Boot with MySQL, Redis, and Docker for enterprise-grade applications.',
      'Design and ship RESTful APIs within a large modular codebase, following clean-architecture and code-review practices.',
      'Improve service performance by optimizing database queries and Redis caching layers.'
    ]
  },
  {
    id: 2,
    period: 'June 2025 - June 2026',
    company: 'BytesPak',
    role: 'Full-Stack Developer',
    stack: 'Next.js, Nest.js, React, PostgreSQL, Prisma, Supabase',
    achievements: [
      'Delivered enterprise products end to end, including a multi-department CRM and an AI-powered maintenance platform.',
      'Built full-stack applications with Next.js, Nest.js, React, PostgreSQL, Prisma, and Supabase.',
      'Architected multi-role platforms with role-based access control, dashboards, reporting, and workflow automation.',
      'Owned deployments across Vercel, Render, Supabase, Neon, and Cloudflare.'
    ]
  }
];

/** Job card reveal — also orchestrates the achievement list stagger inside it. */
const experienceItemVariants: Variants = {
  hidden: { opacity: 0, x: -motionTokens.distance.lg },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: motionTokens.duration.slow,
      ease: motionTokens.easing.smooth,
      staggerChildren: motionTokens.stagger.fast,
      delayChildren: motionTokens.duration.fast,
    },
  },
};

export const Experience: React.FC = () => {
  return (
    <Section id="experience" className="py-12 md:py-16">
      <SectionTitle subtitle="Deploy history">Experience</SectionTitle>

      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-4 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-[var(--color-accent)] via-[var(--color-border)] to-transparent"></div>

        <div className="space-y-12">
          {experiences.map((exp) => (
            <motion.div
              key={exp.id}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={experienceItemVariants}
              className="relative pl-12 md:pl-24"
            >
              {/* Release marker */}
              <div className="absolute left-12 md:left-24 -top-3 font-mono text-[10px] uppercase tracking-wider text-gray-500 hidden md:block" aria-hidden="true">
                {exp.id === 1 ? 'HEAD → production' : `release v${experiences.length - exp.id + 1}`}
              </div>
              {/* Timeline Dot */}
              <div className="absolute left-4 md:left-8 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-[var(--color-accent)] border-4 border-[var(--color-bg)] shadow-lg z-10 theme-transition"></div>

              {/* Card */}
              <div className="surface p-6 md:p-8 hover:shadow-xl">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6 gap-4">
                  <div>
                    <h3 className="font-display text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      {exp.company}
                    </h3>
                    <div className="flex items-center gap-2 text-[var(--color-accent)] font-mono text-sm mb-2">
                      <Briefcase className="w-4 h-4" aria-hidden="true" />
                      <span>{exp.role}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-chip)] border border-[var(--color-border)] w-fit theme-transition">
                    <Calendar className="w-3 h-3 text-gray-500" aria-hidden="true" />
                    <span className="text-xs font-mono font-medium text-gray-600 dark:text-gray-300">
                      {exp.period}
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="text-sm text-gray-500 font-mono mb-3 uppercase tracking-wider">
                    Changelog
                  </div>
                  <ul className="grid grid-cols-1 gap-3">
                    {exp.achievements.map((item) => (
                      <motion.li
                        key={item}
                        variants={fadeSideItem}
                        className="flex items-start gap-3 text-gray-600 dark:text-gray-300 text-sm leading-relaxed"
                      >
                        <span className="font-mono text-[var(--color-accent)] flex-shrink-0 w-4 text-center" aria-hidden="true">+</span>
                        <span>{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 border-t border-[var(--color-border)]">
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mb-2">TECH STACK</div>
                  <div className="flex flex-wrap gap-2">
                    {exp.stack.split(', ').map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-1 bg-[var(--color-chip)] rounded text-xs text-gray-600 dark:text-gray-400 border border-[var(--color-border)] theme-transition"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
};
