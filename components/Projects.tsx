import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useVelocity,
} from 'framer-motion';
import { ArrowUpRight, Github, X } from 'lucide-react';
import { Section, SectionTitle } from './ui/Section';
import { Project } from '../types';
import { springs } from '../lib/motion-tokens';

/*
 * Grouped by kind so the strongest work leads. Previously all seven projects
 * carried identical weight, which buried InsureLink and put four marketing
 * sites on the same footing as multi-role enterprise platforms.
 */
export const projectGroups: {
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
        summary: 'Multi-tenant health-insurance claims platform for hospitals, insurers, corporates and patients.',
        featured: true,
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
        summary: 'Enterprise CRM that unifies sales, HR, development and accounts, with real-time chat and Kanban.',
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
        id: 8,
        title: 'Bytescart',
        summary: 'No-code ecommerce builder that generates and deploys a complete store from a few guided choices.',
        description:
          'A no-code ecommerce store builder. A founder picks a store name, niche and style, and Bytescart generates the storefront, products, Stripe payments and shipping, then deploys the store live, with a dashboard for orders and analytics.',
        tech: ['Next.js', 'PostgreSQL', 'Prisma', 'Stripe', 'OpenAI APIs'],
        image: 'projects/bytescart.webp',
        link: 'https://www.bytescart.ai/',
        flow: ['Guided setup', 'Next.js', 'OpenAI', 'Prisma', 'PostgreSQL', 'Stripe'],
        caseStudy: {
          problem:
            'Launching an online store usually means hiring developers and designers for the storefront, backend, payments and hosting.',
          role: 'Full-stack developer at BytesPak, built end to end.',
          stack: 'Next.js app with Prisma on PostgreSQL, Stripe payments configured per store, OpenAI for store and product content generation.',
        },
      },
      {
        id: 4,
        title: 'VerticalWorx',
        summary: 'Aviation sales & operations platform with dashboards, lead tracking and automated reporting.',
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
        summary: 'AI maintenance assistant that turns photos and voice into step-by-step repair guides.',
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
        summary: 'Outreach pipeline that queues, personalizes with OpenAI, sends and tracks email campaigns.',
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
        summary: 'Highly animated marketing site with scroll-triggered effects and 3D visuals.',
        description: 'Highly animated marketing site with scroll-triggered effects and 3D visuals.',
        tech: ['Next.js', 'Tailwind', 'Framer Motion', '@react-three/fiber'],
        image: 'projects/bytes-website.webp',
        link: 'http://bytesplatform.com/',
      },
      {
        id: 6,
        title: 'IndigoTG Website',
        summary: 'Responsive corporate site for a trading & logistics company.',
        description:
          'Corporate website with clean UI and responsive layout for a trading & logistics company.',
        tech: ['Next.js', 'Tailwind CSS'],
        image: 'projects/indigotg.webp',
        link: 'https://indigotg.vercel.app/',
      },
    ],
  },
];

const ALL = projectGroups.flatMap((g) => g.projects.map((project) => ({ project, group: g.label })));
const TABS = ['All', ...projectGroups.map((g) => g.label)];
const tabSlug = (t: string) => t.toLowerCase().replace(/[^a-z]+/g, '-');
const pad = (n: number) => String(n).padStart(2, '0');

/** Detail view: the card's screenshot frame morphs into this dialog. */
const ProjectDetail: React.FC<{ project: Project; group: string; onClose: () => void }> = ({
  project,
  group,
  onClose,
}) => {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      prev?.focus?.({ preventScroll: true });
    };
  }, [onClose]);

  const study = project.caseStudy
    ? ([
        ['Problem', project.caseStudy.problem],
        ['Role', project.caseStudy.role],
        ['Stack', project.caseStudy.stack],
        ['Result', project.caseStudy.result],
      ] as const).filter(([, v]) => v)
    : [];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 md:p-8" data-lenis-prevent>
      <motion.div
        className="absolute inset-0 bg-black/50 dark:bg-black/70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
        aria-hidden="true"
      />
      <motion.div
        layoutId={`project-${project.id}`}
        transition={springs.snappy}
        role="dialog"
        aria-modal="true"
        aria-label={project.title}
        className="surface relative w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
        style={{ borderRadius: 16 }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.15, duration: 0.3 } }}
          exit={{ opacity: 0, transition: { duration: 0.1 } }}
          className="aspect-[205/100] w-full overflow-hidden bg-[var(--color-deep)]"
        >
          <img src={project.image} alt={project.title} className="w-full h-full object-contain object-bottom" />
        </motion.div>
        <button
          ref={closeRef}
          onClick={onClose}
          className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full bg-[var(--color-card)] border border-[var(--color-border)] text-gray-600 dark:text-gray-300 hover:text-[var(--color-accent)] transition-colors cursor-pointer"
          aria-label="Close details"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.15, duration: 0.3 } }}
          exit={{ opacity: 0, transition: { duration: 0.1 } }}
          className="p-6 md:p-8"
        >
          <p className="font-mono text-xs mb-2">
            <span className="text-[var(--color-accent)]">{new URL(project.link).host}</span>
            <span className="text-gray-500"> · ~/{tabSlug(group)}</span>
          </p>
          <h3 className="font-display text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">{project.title}</h3>
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
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">{project.description}</p>

          {study.length > 0 && (
            <dl className="mb-6 grid gap-4 sm:grid-cols-2 border-l-2 border-[var(--color-accent)] pl-4 text-sm leading-relaxed">
              {study.map(([label, value]) => (
                <div key={label}>
                  <dt className="font-mono text-xs uppercase tracking-wider text-gray-500">{label}</dt>
                  <dd className="text-gray-600 dark:text-gray-400">{value}</dd>
                </div>
              ))}
            </dl>
          )}

          <div className="flex flex-wrap gap-2 mb-6">
            {project.tech.map((t) => (
              <span
                key={t}
                className="px-3 py-1 rounded-full bg-[var(--color-chip)] border border-[var(--color-border)] text-xs font-mono text-gray-600 dark:text-gray-400"
              >
                {t}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-black rounded-full font-medium hover:bg-[var(--color-accent)] dark:hover:bg-[var(--color-accent)] dark:hover:text-white active:scale-[0.97] transition-[background-color,color,transform] duration-150 ease-out group cursor-pointer"
            >
              Visit live site
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
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[var(--color-border)] text-gray-900 dark:text-white font-medium hover:border-[var(--color-border-hover)] cursor-pointer"
              >
                <Github className="w-4 h-4" aria-hidden="true" />
                Source
              </a>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

/*
 * Index list with a floating hover preview. Each project is one slim row;
 * no screenshots sit on the page. On mouse devices a preview card follows the
 * cursor on a spring, tilts with its velocity, and its image reel slides to
 * the hovered project. Clicking a row morphs it into the detail dialog.
 *
 * Performance: the preview moves with transforms only, and hover never
 * changes any row's height (so the scroll trace never has to re-measure).
 */
const PREVIEW_W = 420;
const FRAME_H = 236;
const PREVIEW_H = FRAME_H + 100; // + title bar and caption
/* Card top, centred on the cursor but kept fully inside the viewport */
const previewTop = (clientY: number) =>
  Math.min(Math.max(clientY - PREVIEW_H / 2, 12), window.innerHeight - PREVIEW_H - 12);

export const Projects: React.FC = () => {
  const [tab, setTab] = useState('All');
  const [active, setActive] = useState<{ project: Project; group: string } | null>(null);
  const [hoverId, setHoverId] = useState<number | null>(null);
  const [inside, setInside] = useState(false);
  const [flip, setFlip] = useState(false);
  const close = useCallback(() => setActive(null), []);
  const visible = tab === 'All' ? ALL : ALL.filter((x) => x.group === tab);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 350, damping: 32, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 350, damping: 32, mass: 0.5 });
  const vx = useVelocity(sx);
  const rotate = useSpring(useTransform(vx, [-1400, 0, 1400], [-9, 0, 9], { clamp: true }), {
    stiffness: 200,
    damping: 25,
  });

  const onEnter = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    // Start at the cursor instead of flying in from the corner
    x.jump(e.clientX);
    y.jump(previewTop(e.clientY));
    sx.jump(e.clientX);
    sy.jump(previewTop(e.clientY));
    setInside(true);
  };
  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    x.set(e.clientX);
    y.set(previewTop(e.clientY));
    const f = e.clientX > window.innerWidth - PREVIEW_W - 80;
    if (f !== flip) setFlip(f);
  };

  const hoverIdx = Math.max(
    ALL.findIndex((p) => p.project.id === hoverId),
    0,
  );
  const hovered = ALL[hoverIdx].project;
  const showPreview = inside && hoverId !== null && !active;

  return (
    <LayoutGroup>
      <Section id="projects" className="py-12 md:py-16">
        <SectionTitle subtitle="Projects">Selected Work</SectionTitle>

        <div
          role="tablist"
          aria-label="Filter projects"
          className="-mx-6 mb-8 flex gap-2 overflow-x-auto px-6 md:mx-0 md:px-0 [scrollbar-width:none]"
        >
          {TABS.map((t) => {
            const count = t === 'All' ? ALL.length : ALL.filter((x) => x.group === t).length;
            const selected = tab === t;
            return (
              <button
                key={t}
                role="tab"
                aria-selected={selected}
                onClick={() => setTab(t)}
                className={`relative shrink-0 rounded-full px-4 py-2 font-mono text-xs transition-colors cursor-pointer ${
                  selected
                    ? 'text-[var(--color-accent)]'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white border border-[var(--color-border)]'
                }`}
              >
                {selected && (
                  <motion.span
                    layoutId="project-tab"
                    transition={springs.snappy}
                    className="absolute inset-0 rounded-full border border-[var(--color-accent)] bg-[var(--color-accent-wash)]"
                  />
                )}
                <span className="relative">
                  {tabSlug(t)} <span className="text-gray-500">{count}</span>
                </span>
              </button>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Column header */}
          <div className="hidden md:grid grid-cols-[3.5rem_1fr_11rem_14rem_2.5rem] gap-4 px-4 pb-3 font-mono text-[10px] uppercase tracking-wider text-gray-500">
            <span>#</span>
            <span>project</span>
            <span>dir</span>
            <span>stack</span>
            <span />
          </div>

          <ul
            className="group/list border-t border-[var(--color-border)]"
            onPointerEnter={onEnter}
            onPointerMove={onMove}
            onPointerLeave={() => setInside(false)}
          >
            <AnimatePresence initial={false} mode="popLayout">
              {visible.map(({ project, group }) => {
                const idx = ALL.findIndex((p) => p.project.id === project.id);
                const isOpen = active?.project.id === project.id;
                return (
                  <motion.li
                    key={project.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="border-b border-[var(--color-border)] transition-opacity duration-300 group-hover/list:opacity-40 hover:!opacity-100"
                  >
                    <button
                      type="button"
                      onClick={() => setActive({ project, group })}
                      onPointerEnter={() => setHoverId(project.id)}
                      aria-label={`Open details for ${project.title}`}
                      aria-haspopup="dialog"
                      className="group relative grid w-full grid-cols-[2.25rem_1fr_auto] md:grid-cols-[3.5rem_1fr_11rem_14rem_2.5rem] items-center gap-3 md:gap-4 px-2 md:px-4 py-5 md:py-7 text-left cursor-pointer"
                    >
                      {/* Morph anchor for the detail dialog */}
                      {!isOpen && (
                        <motion.span
                          layoutId={`project-${project.id}`}
                          transition={springs.snappy}
                          className="absolute inset-0"
                          style={{ borderRadius: 0 }}
                          aria-hidden="true"
                        />
                      )}
                      {/* Hover sweep */}
                      <span
                        className="absolute inset-0 origin-left scale-x-0 bg-[var(--color-accent-wash)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100 group-focus-visible:scale-x-100"
                        aria-hidden="true"
                      />

                      <span className="relative font-mono text-xs md:text-sm text-gray-500 group-hover:text-[var(--color-accent)] transition-colors">
                        {pad(idx + 1)}
                      </span>
                      <span className="relative min-w-0">
                        <span className="flex items-center gap-3 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-3">
                          <span className="truncate font-display text-2xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                            {project.title}
                          </span>
                          {project.featured && (
                            <span className="hidden sm:inline shrink-0 rounded-full border border-[var(--color-accent)] px-2 py-0.5 font-mono text-[10px] text-[var(--color-accent)]">
                              featured
                            </span>
                          )}
                        </span>
                        <span className="md:hidden mt-1 block font-mono text-[11px] text-gray-500">~/{tabSlug(group)}</span>
                      </span>
                      <span className="relative hidden md:block font-mono text-xs text-gray-500">~/{tabSlug(group)}</span>
                      <span className="relative hidden md:block truncate font-mono text-xs text-gray-500">
                        {project.tech.slice(0, 3).join(' · ')}
                      </span>
                      <span className="relative justify-self-end">
                        <ArrowUpRight
                          className="w-5 h-5 text-gray-500 transition-[transform,color] duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--color-accent)]"
                          aria-hidden="true"
                        />
                      </span>
                    </button>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        </motion.div>
      </Section>

      {/* Floating preview (mouse devices only) */}
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-30 hidden [@media(hover:hover)]:block"
        style={{ x: sx, y: sy, rotate }}
        aria-hidden="true"
      >
        <motion.div
          initial={false}
          animate={showPreview ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.85 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-2xl shadow-black/50"
          style={{
            width: PREVIEW_W,
            marginLeft: flip ? -(PREVIEW_W + 28) : 28,
            transformOrigin: flip ? 'right center' : 'left center',
          }}
        >
          <div className="flex items-center gap-1.5 border-b border-[var(--color-border)] bg-[var(--color-elevated)] px-3 py-2">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="ml-2 truncate font-mono text-[10px] text-gray-500">{new URL(hovered.link).host}</span>
          </div>
          <div className="relative overflow-hidden bg-[var(--color-deep)]" style={{ height: FRAME_H }}>
            <motion.div animate={{ y: -hoverIdx * FRAME_H }} transition={springs.snappy}>
              {ALL.map(({ project }) => (
                <img
                  key={project.id}
                  src={project.image}
                  alt=""
                  decoding="async"
                  className="block w-full object-cover object-top"
                  style={{ height: FRAME_H }}
                />
              ))}
            </motion.div>
          </div>
          <div className="px-4 py-3 font-mono text-[11px] leading-relaxed text-gray-600 dark:text-gray-400">
            <span className="text-[var(--color-accent)]">$ </span>
            {hovered.summary ?? hovered.description}
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {active && <ProjectDetail key={active.project.id} project={active.project} group={active.group} onClose={close} />}
      </AnimatePresence>
    </LayoutGroup>
  );
};
