import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowUpRight, Github } from 'lucide-react';
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
          'A multi-tenant health-insurance claims platform connecting hospitals, insurers, corporates, and policyholders. Covers claim submission, reimbursement workflows, real-time tracking, secure document management, and internal messaging.',
        tech: ['Next.js', 'Nest.js', 'PostgreSQL', 'Prisma', 'RBAC', 'Automation'],
        image: 'projects/FYP.webp',
        link: 'https://insure-link-henna.vercel.app/',
        flow: ['Next.js', 'Nest.js API', 'RBAC', 'Prisma', 'PostgreSQL'],
        // TODO: add `repo` (public GitHub URL), `role`, and a defensible `result`.
        caseStudy: {
          problem:
            'Hospitals, insurers, corporates, and patients ran claims and reimbursements through disconnected, manual processes.',
          stack: 'Multi-tenant Nest.js API with Prisma on PostgreSQL, role-based access per party, secure document management, workflow automation to shorten claim turnaround.',
        },
      },
      {
        id: 1,
        title: 'CRM Platform',
        description:
          'An enterprise CRM connecting sales, HR, development, and accounts teams, with real-time chat, Kanban boards, analytics dashboards, and workflow systems.',
        tech: ['Next.js', 'Nest.js', 'PostgreSQL', 'Prisma', 'Supabase'],
        image: 'projects/crm.webp',
        link: 'https://crm-frontend-eight-gamma.vercel.app/',
        flow: ['Next.js', 'Nest.js API', 'Prisma', 'PostgreSQL'],
        // TODO: add `repo`, and a defensible `result`.
        caseStudy: {
          problem:
            'Multiple departments needed one system for customer workflows, internal chat, and reporting instead of separate tools.',
          role: 'Full-stack developer at BytesPak.',
          stack: 'Nest.js + Prisma on PostgreSQL (Supabase), Next.js front end, real-time chat and Kanban boards.',
        },
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
        tech: ['Next.js', 'Nest.js', 'OpenAI APIs', 'Supabase', 'Google OAuth', 'Voice & Image Input'],
        image: 'projects/intellimaint.webp',
        link: 'https://intellimaint-ai.vercel.app/',
        flow: ['Image / Voice', 'Next.js', 'Nest.js', 'OpenAI', 'Guide'],
        // TODO: add `repo`, and a defensible `result`.
        caseStudy: {
          problem:
            'Maintenance technicians lose time hunting through manuals to diagnose faults on the shop floor.',
          role: 'Full-stack developer at BytesPak.',
          stack: 'Next.js + Nest.js, OpenAI APIs for voice and image input, Google OAuth sign-in, Supabase-backed storage.',
        },
      },
      {
        id: 3,
        title: 'Email Automation System',
        description:
          'Outreach pipeline built for a private client (name withheld): a Node.js backend that queues, personalizes (OpenAI), and sends email campaigns, with delivery tracking and follow-up automation.',
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

/* Chips that the request-path strip already shows are dropped, so the same
   stack isn't printed twice. Compares on letters/digits only ("Nest.js API" ~ "Nest.js"). */
const norm = (s: string) => s.toLowerCase().replace(/\s*apis?$/, '').replace(/[^a-z0-9]/g, '');
const extraTech = (p: Project) =>
  p.flow ? p.tech.filter((t) => !p.flow!.some((f) => norm(f) === norm(t))) : p.tech;

const totalProjects = projectGroups.reduce((n, g) => n + g.projects.length, 0);

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
          <span className="ml-3 -mt-1 font-mono text-[10px] text-gray-500">{new URL(project.link).host}</span>
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
                ~/{group.label.toLowerCase().replace(/[^a-z]+/g, '-')}/
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
                    <p className="font-mono text-xs text-[var(--color-accent)] mb-2" aria-hidden="true">
                      {String(order + 1).padStart(2, '0')} / {String(totalProjects).padStart(2, '0')}
                    </p>
                    <h4 className="font-display text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white theme-transition">
                      {project.title}
                    </h4>

                    {project.flow && (
                      <div
                        className="mb-5 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] text-gray-500"
                        aria-label={`Request path: ${project.flow.join(' to ')}`}
                      >
                        {project.flow.map((node, i) => (
                          <React.Fragment key={node}>
                            {i > 0 && (
                              <span className="text-[var(--color-accent)]" aria-hidden="true">
                                →
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded border border-[var(--color-border)] bg-[var(--color-chip)] text-gray-700 dark:text-gray-300 whitespace-nowrap">
                              {node}
                            </span>
                          </React.Fragment>
                        ))}
                      </div>
                    )}

                    {extraTech(project).length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {extraTech(project).map((t) => (
                        <span
                          key={t}
                          className="px-3 py-1 rounded-full bg-[var(--color-chip)] border border-[var(--color-border)] text-xs font-mono text-gray-600 dark:text-gray-400 theme-transition"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    )}

                    <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed theme-transition">
                      {project.description}
                    </p>

                    {project.caseStudy && (
                      <dl className="mb-8 space-y-3 border-l-2 border-[var(--color-border)] pl-4 text-sm leading-relaxed">
                        {(
                          [
                            ['Problem', project.caseStudy.problem],
                            ['Role', project.caseStudy.role],
                            ['Stack', project.caseStudy.stack],
                            ['Result', project.caseStudy.result],
                          ] as const
                        ).map(
                          ([label, value]) =>
                            value && (
                              <div key={label}>
                                <dt className="font-mono text-xs uppercase tracking-wider text-gray-500">{label}</dt>
                                <dd className="text-gray-600 dark:text-gray-400">{value}</dd>
                              </div>
                            ),
                        )}
                      </dl>
                    )}

<div className="flex flex-wrap items-center gap-3">
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-black rounded-full font-medium hover:bg-[var(--color-accent)] dark:hover:bg-[var(--color-accent)] dark:hover:text-white hover:shadow-lg hover:shadow-[color:var(--color-accent-glow)] active:scale-[0.97] transition-[background-color,color,transform,box-shadow] duration-150 ease-out group cursor-pointer"
                    >
                      View Project
                      <ArrowUpRight
                        className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-150 ease-out"
                        aria-hidden="true"
                      />
                    </a>
                    {project.repo && (
                      <a
                        href={project.repo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[var(--color-border)] text-gray-900 dark:text-white font-medium hover:border-[var(--color-border-hover)] active:scale-[0.97] transition-[border-color,transform] duration-150 ease-out cursor-pointer"
                      >
                        <Github className="w-4 h-4" aria-hidden="true" />
                        Source
                      </a>
                    )}
                    </div>
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
