import React from 'react';
import { motion } from 'framer-motion';
import { Layout, Server, Terminal, Workflow, Code2 } from 'lucide-react';
import { Section, SectionTitle, StaggerGroup, StaggerItem } from './ui/Section';
import { SkillCategory } from '../types';
import { motionTokens, springs } from '../lib/motion-tokens';

// Enhanced skills data matching Umair's profile
const skills: SkillCategory[] = [
  {
    title: 'Automation & AI',
    icon: Workflow,
    skills: ['Workflow Automation', 'Web Scraping', 'OpenAI Integrations', 'Data Processing', 'Bot Development']
  },
  {
    title: 'Backend Engineering',
    icon: Server,
    skills: ['Nest.js', 'Node.js', 'PostgreSQL', 'Prisma', 'Supabase', 'REST APIs', 'Auth & RBAC', 'MongoDB', 'MySQL']
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

      {/* Decorative "System Status" text */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: motionTokens.duration.normal }}
        className="mt-12 flex justify-between items-center text-xs font-mono text-gray-500 dark:text-gray-400 border-t border-black/5 dark:border-white/5 pt-6 transition-colors duration-500"
      >
        <span>SYSTEM_STATUS: ONLINE</span>
        <span>ALL SYSTEMS OPERATIONAL</span>
      </motion.div>
    </Section>
  );
};

const SkillCard: React.FC<{ category: SkillCategory }> = ({ category }) => {
  return (
    <motion.div
      whileHover={{ scale: motionTokens.scale.pop }}
      transition={springs.snappy}
      className="group relative overflow-hidden rounded-3xl bg-white dark:bg-[var(--color-card)] border border-gray-400 dark:border-white/5 p-8 transition-colors duration-500 hover:border-gray-500 dark:hover:border-white/20 shadow-sm hover:shadow-lg dark:shadow-none h-full"
    >
      {/* Hover Gradient Effect */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.08) 0%, transparent 70%)'
        }}
        aria-hidden="true"
      />

      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-300 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 group-hover:bg-blue-500 group-hover:text-white">
            <category.icon className="w-6 h-6" aria-hidden="true" />
          </div>
          <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100 transition-colors duration-500">{category.title}</h3>
        </div>

        <div className="flex flex-wrap gap-2">
          {category.skills.map((skill) => (
            <span
              key={skill}
              className="px-3 py-1.5 text-sm font-mono rounded-lg bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 border border-gray-400 dark:border-white/5 transition-colors duration-300 group-hover:bg-gray-100 dark:group-hover:bg-white/10 group-hover:text-gray-900 dark:group-hover:text-gray-200 hover:!bg-gray-200 dark:hover:!bg-white/20 hover:!border-gray-500 dark:hover:!border-white/20"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Decorative Corner Lines */}
      <div className="absolute top-0 right-0 p-4 opacity-10 dark:opacity-20 group-hover:opacity-20 dark:group-hover:opacity-40 transition-opacity" aria-hidden="true">
        <Code2 className="w-16 h-16 text-black dark:text-white stroke-[0.5]" />
      </div>
    </motion.div>
  );
};
