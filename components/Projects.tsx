import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Section, SectionTitle } from './ui/Section';
import { Project } from '../types';
import { springs, fadeUpItem } from '../lib/motion-tokens';

/*
 * Grouped by kind so the strongest work leads. Previously all seven projects
 * carried identical weight, which buried InsureLink and put four marketing
 * sites on the same footing as multi-role enterprise platforms.
 */
const projectGroups: {
  label: string;
  note: string;
  projects: Project[];
}[] = [
  {
    label: 'Platforms',
    note: 'Multi-role systems — RBAC, real-time data, reporting',
    projects: [
      {
        id: 7,
        title: 'InsureLink (FYP)',
        description:
          'A centralized health-insurance automation platform that connects hospitals, insurers, corporates, and patients. Enables real-time eligibility verification, automated claim workflows, transparent communication, and an AI-powered chatbot for claim and policy guidance.',
        tech: ['Next.js', 'Nest.js', 'PostgreSQL', 'OpenAI API', 'RBAC', 'Automation'],
        image: 'projects/FYP.webp',
        link: 'https://insure-link-henna.vercel.app/',
      },
      {
        id: 1,
        title: 'CRM Platform',
        description:
          'An enterprise CRM with real-time chat, analytics dashboards, multi-department workflows, and automated reporting.',
        tech: ['Next.js', 'Nest.js', 'PostgreSQL', 'Prisma', 'Supabase'],
        image: 'projects/crm.webp',
        link: 'https://crm-frontend-eight-gamma.vercel.app/',
      },
      {
        id: 4,
        title: 'VerticalWorx',
        description:
          'Aviation sales & operations platform with analytics, dashboards, lead tracking, and automated reporting.',
        tech: ['Next.js', 'PostgreSQL', 'Prisma'],
        image: 'projects/vertical-worx.webp',
        link: 'https://verticalworx.aero/',
      },
    ],
  },
  {
    label: 'AI & Automation',
    note: 'LLM-backed tooling and high-volume pipelines',
    projects: [
      {
        id: 2,
        title: 'IntelliMaint AI',
        description:
          'AI-powered maintenance assistant that generates step-by-step troubleshooting guides from images and voice commands.',
        tech: ['Next.js', 'OpenAI APIs', 'Voice Input', 'Image Recognition', 'Tailwind CSS'],
        image: 'projects/intellimaint.webp',
        link: 'https://intellimaint-ai.vercel.app/',
      },
      {
        id: 3,
        title: 'Email Automation System',
        description:
          'Scrapes websites → detects problems → generates personalized emails → sends at scale (50k–90k emails). Includes tracking and follow-up automation.',
        tech: ['Next.js', 'Node.js', 'OpenAI APIs', 'Automation'],
        image: 'projects/email-automation.webp',
        link: 'http://email-frontend-bytes.vercel.app/',
      },
    ],
  },
  {
    label: 'Client Sites',
    note: 'Marketing sites and product front-ends',
    projects: [
      {
        id: 5,
        title: 'BytesPlatform Website',
        description: 'Highly animated marketing site with scroll-triggered effects and 3D visuals.',
        tech: ['Next.js', 'Tailwind', 'Framer Motion', '@react-three/fiber'],
        image: 'projects/bytes-website.webp',
        link: 'http://bytesplatform.com/',
      },
      {
        id: 6,
        title: 'IndigoTG Website',
        description:
          'Corporate website with clean UI and responsive layout for a trading & logistics company.',
        tech: ['Next.js', 'Tailwind CSS'],
        image: 'projects/indigotg.webp',
        link: 'https://indigotg.vercel.app/',
      },
    ],
  },
];

/* Global ordering across all groups, so the left/right zigzag alternates
   continuously instead of restarting at every group. */
const orderedGroups = projectGroups.map((group, gi) => {
  const offset = projectGroups
    .slice(0, gi)
    .reduce((total, g) => total + g.projects.length, 0);
  return {
    ...group,
    items: group.projects.map((project, i) => ({ project, order: offset + i })),
  };
});

/** Project visual: cursor-following glow + subtle 3D tilt on hover. */
const ProjectVisual: React.FC<{ project: Project }> = ({ project }) => {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-6, 6]), springs.release);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]), springs.release);

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return;
    const el = ref.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    mx.set((e.clientX - left) / width - 0.5);
    my.set((e.clientY - top) / height - 0.5);
  };

  const onPointerLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <a
      href={project.link}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open ${project.title}`}
      className="w-full md:w-3/5 group relative block [perspective:1200px]"
    >
      <motion.div
        ref={ref}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        transition={springs.release}
        className="surface relative overflow-hidden shadow-lg group-hover:shadow-xl"
      >
        <div className="aspect-[190/100] md:aspect-[205/100] w-full overflow-hidden bg-[var(--color-deep)]">
          <img
            src={project.image}
            alt={project.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-contain object-bottom transform group-hover:scale-105 transition-transform duration-700"
          />
        </div>

        {/* Overlay UI elements */}
        <div className="absolute top-4 left-4 flex gap-2" aria-hidden="true">
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
        </div>
      </motion.div>
    </a>
  );
};

export const Projects: React.FC = () => {
  return (
    <Section id="projects" className="py-12 md:py-16">
      <SectionTitle subtitle="Projects">Selected Work</SectionTitle>

      <div className="space-y-16 md:space-y-24">
        {orderedGroups.map((group) => (
          <div key={group.label}>
            <header className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 border-b border-[var(--color-border)] pb-4 mb-10 md:mb-14">
              <h3 className="font-mono text-sm uppercase tracking-wider text-[var(--color-accent)]">
                {group.label}
              </h3>
              <p className="text-sm text-gray-500">{group.note}</p>
            </header>

            <div className="space-y-20 md:space-y-28">
              {group.items.map(({ project, order }) => (
                <motion.div
                  key={project.id}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-80px' }}
                  variants={fadeUpItem}
                  className={`flex flex-col ${
                    order % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'
                  } gap-12 items-center`}
                >
                  <ProjectVisual project={project} />

                  {/* Content Side */}
                  <div className="w-full md:w-2/5">
                    <h4 className="font-display text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white theme-transition">
                      {project.title}
                    </h4>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {project.tech.map((t) => (
                        <span
                          key={t}
                          className="px-3 py-1 rounded-full bg-[var(--color-chip)] border border-[var(--color-border)] text-xs font-mono text-gray-600 dark:text-gray-400 theme-transition"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed theme-transition">
                      {project.description}
                    </p>

                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-black rounded-full font-medium hover:bg-[var(--color-accent)] dark:hover:bg-[var(--color-accent)] dark:hover:text-white hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.97] transition-[background-color,color,transform,box-shadow] duration-150 ease-out group cursor-pointer"
                    >
                      View Project
                      <ArrowUpRight
                        className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-150 ease-out"
                        aria-hidden="true"
                      />
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
};
