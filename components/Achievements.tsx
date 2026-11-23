import React from 'react';
import { GraduationCap, Trophy, BadgeCheck, type LucideIcon } from 'lucide-react';
import { Section, SectionTitle, StaggerGroup, StaggerItem } from './ui/Section';
import { motionTokens } from '../lib/motion-tokens';

/* Source of truth: resume.pdf (Education, Certifications and Achievements). */
const items: {
  icon: LucideIcon;
  tag: string;
  title: string;
  detail: string;
  meta: string;
}[] = [
  {
    icon: GraduationCap,
    tag: 'education',
    title: 'BS Computer Science, FAST-NUCES',
    detail: "3.70 CGPA · Dean's List, 6 semesters · Full scholarship",
    meta: '2022 – 2026',
  },
  {
    icon: Trophy,
    tag: 'achievement',
    title: '1st place among 8+ teams',
    detail: 'FAST Entrepreneurship Society Competition',
    meta: '2026',
  },
  {
    icon: BadgeCheck,
    tag: 'certification',
    title: 'Introduction to Modern AI',
    detail: 'Cisco Networking Academy',
    meta: '2026',
  },
];

export const Achievements: React.FC = () => (
  <Section id="achievements" className="py-12 md:py-16">
    <SectionTitle subtitle="Achievements">Education &amp; Recognition</SectionTitle>

    <StaggerGroup className="grid grid-cols-1 md:grid-cols-3 gap-6" stagger={motionTokens.stagger.normal}>
      {items.map((item) => (
        <StaggerItem key={item.title} className="h-full">
          <div className="surface group h-full p-6 hover:shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-[var(--color-chip)] text-gray-600 dark:text-gray-400 transition-colors duration-150 group-hover:bg-[var(--color-accent)] group-hover:text-white">
                <item.icon className="w-5 h-5" aria-hidden="true" />
              </div>
              <span className="font-mono text-xs text-gray-500">{item.meta}</span>
            </div>
            <p className="font-mono text-xs uppercase tracking-wider text-[var(--color-accent)] mb-2">
              {item.tag}
            </p>
            <h3 className="font-display text-lg font-bold text-gray-900 dark:text-white mb-1">
              {item.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.detail}</p>
          </div>
        </StaggerItem>
      ))}
    </StaggerGroup>
  </Section>
);
