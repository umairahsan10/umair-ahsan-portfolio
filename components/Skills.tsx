import React from 'react';
import { motion } from 'framer-motion';
import { Layout, Server, Terminal, Workflow } from 'lucide-react';
import { Section, SectionTitle, StaggerGroup, StaggerItem } from './ui/Section';
import { SkillCategory } from '../types';
import { motionTokens } from '../lib/motion-tokens';

const skills: SkillCategory[] = [
  {
    title: 'Backend Engineering',
    icon: Server,
    skills: ['Java', 'Spring Boot', 'Redis', 'Nest.js', 'Node.js', 'PostgreSQL', 'Prisma', 'Supabase', 'REST APIs', 'Auth & RBAC', 'MongoDB', 'MySQL']
  },
  {
    title: 'Automation & AI',
    icon: Workflow,
    skills: ['Workflow Automation', 'Web Scraping', 'OpenAI Integrations', 'Data Processing', 'Bot Development']
  },
  {
    title: 'Frontend Ecosystem',
    icon: Layout,
    skills: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Framer Motion', '@react-three/fiber', 'HTML', 'CSS']
  },
  {
    title: 'DevOps & Cloud',
    icon: Terminal,
    skills: ['Vercel', 'Render', 'Neon', 'Cloudflare', 'GitHub CI/CD', 'Linux', 'Docker', 'Postman', 'nginx']
  },
];

const totalSkills = skills.reduce((count, category) => count + category.skills.length, 0);

export const Skills: React.FC = () => {
  return (
    <Section id="skills" className="pt-20 pb-12 md:py-16">
      <SectionTitle subtitle="Tech Stack">My Arsenal</SectionTitle>

      <StaggerGroup className="grid grid-cols-1 md:grid-cols-2 gap-6" stagger={motionTokens.stagger.normal}>
        {skills.map((category) => (
          <StaggerItem key={category.title}>
            <SkillCard category={category} />
          </StaggerItem>
        ))}
      </StaggerGroup>

      {/* Real counts, derived from the data above — replaces the old fake terminal chrome */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: motionTokens.duration.normal }}
        className="mt-12 flex justify-between items-center text-xs font-mono text-gray-500 border-t border-[var(--color-border)] pt-6 theme-transition"
      >
        <span>$ ls ~ | wc -l → {skills.length} directories</span>
        <span>{totalSkills} modules loaded</span>
      </motion.div>
    </Section>
  );
};

const SkillCard: React.FC<{ category: SkillCategory }> = ({ category }) => {
  return (
    <div className="surface group relative overflow-hidden p-8 hover:shadow-lg h-full">
      {/* Accent wash on hover — kept very low so it reads as depth, not decoration */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, var(--color-accent-wash) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-150 bg-[var(--color-chip)] text-gray-600 dark:text-gray-400 group-hover:bg-[var(--color-accent)] group-hover:text-white">
            <category.icon className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-display text-lg md:text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              {category.title}
            </h3>
            <p className="font-mono text-xs text-gray-500 mt-0.5">
              ~/{category.title.toLowerCase().replace(/[^a-z]+/g, '-')} · {category.skills.length} modules
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {category.skills.map((skill) => (
            <span
              key={skill}
              className="px-3 py-1.5 text-sm font-mono rounded-lg before:content-['+_'] before:text-[var(--color-accent)] bg-[var(--color-chip)] text-gray-600 dark:text-gray-400 border border-[var(--color-border)] hover:border-[var(--color-border-hover)] hover:text-gray-900 dark:hover:text-gray-200 transition-[color,border-color] duration-150 ease-out theme-transition"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
