import type { LucideIcon } from 'lucide-react';

export interface Project {
  id: number;
  title: string;
  /** One line for the grid card; the full description shows in the detail view. */
  summary?: string;
  /** Spans two columns in the grid. */
  featured?: boolean;
  description: string;
  tech: string[];
  image: string;
  link: string;
  /** Request path through the system, left to right. Rendered as an architecture strip. */
  flow?: string[];
  /** Public source repo. Omit until the repo is public — the button only renders when set. */
  repo?: string;
  /** Short case study. Each field renders only when present; never invent numbers. */
  caseStudy?: {
    problem: string;
    role?: string;
    stack?: string;
    result?: string;
  };
}

export interface Experience {
  id: number;
  period: string;
  company: string;
  role: string;
  stack: string;
  achievements: string[];
}

export interface SkillCategory {
  title: string;
  skills: string[];
  icon: LucideIcon;
}
