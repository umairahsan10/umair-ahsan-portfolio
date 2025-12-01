import React from 'react';
import { motion } from 'framer-motion';
import { Section, SectionTitle } from './ui/Section';
import { Experience as ExperienceType } from '../types';
import { Briefcase, Calendar, CheckCircle2 } from 'lucide-react';

const experiences: ExperienceType[] = [
  {
    id: 1,
    period: '2025 - Present',
    company: 'BytesPak',
    role: 'Full-Stack Developer',
    stack: 'Next.js, Nest.js, React, PostgreSQL, Prisma, Tailwind',
    achievements: [
      'Developed multiple full-stack enterprise platforms (CRM, STM, IntelliMaint AI, VerticalWorx).',
      'Architected complex multi-role systems with RBAC, dashboards, automations, and reporting.',
      'Built real-time chat, Kanban boards, analytics, and scalable workflow systems.',
      'Worked on AI-powered automation tools using OpenAI APIs and custom scrapers.',
      'Managed deployments on Vercel, Render, and Supabase.',
      'Ensured clean, modular, production-ready code.'
    ]
  }
];

export const Experience: React.FC = () => {
  return (
    <Section id="experience" className="py-12 md:py-16">
      <SectionTitle subtitle="Work path">Experience</SectionTitle>

      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-4 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500 via-gray-200 dark:via-gray-800 to-transparent"></div>

        <div className="space-y-12">
          {experiences.map((exp, index) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.2 }}
              className="relative pl-12 md:pl-24"
            >
              {/* Timeline Dot */}
              <div className="absolute left-4 md:left-8 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-blue-500 border-4 border-white dark:border-[#121212] shadow-lg z-10"></div>

              {/* Card */}
              <div className="bg-white dark:bg-[#1A1A1A] border border-gray-400 dark:border-white/5 rounded-2xl p-6 md:p-8 hover:shadow-xl hover:border-gray-500 dark:hover:shadow-blue-900/10 transition-all duration-300">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6 gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{exp.company}</h3>
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-mono text-sm mb-2">
                      <Briefcase className="w-4 h-4" />
                      <span>{exp.role}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-400 dark:border-white/5 w-fit">
                    <Calendar className="w-3 h-3 text-gray-500" />
                    <span className="text-xs font-mono font-medium text-gray-600 dark:text-gray-300">{exp.period}</span>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="text-sm text-gray-500 font-mono mb-3 uppercase tracking-wider">Achievements</div>
                  <ul className="grid grid-cols-1 gap-3">
                    {exp.achievements.map((item, i) => (
                      <motion.li 
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + (i * 0.1) }}
                        className="flex items-start gap-3 text-gray-600 dark:text-gray-300 text-sm leading-relaxed"
                      >
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 border-t border-gray-300 dark:border-white/5">
                  <div className="text-xs text-gray-400 font-mono mb-2">TECH STACK</div>
                  <div className="flex flex-wrap gap-2">
                    {exp.stack.split(', ').map((tech) => (
                      <span key={tech} className="px-2 py-1 bg-gray-50 dark:bg-white/5 rounded text-xs text-gray-600 dark:text-gray-400 border border-gray-400 dark:border-white/5">
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