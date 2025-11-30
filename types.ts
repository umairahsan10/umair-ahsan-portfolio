export interface Project {
  id: number;
  title: string;
  description: string;
  tech: string[];
  image: string;
  link: string;
}

export interface Experience {
  id: number;
  period: string;
  company: string;
  role: string;
  stack: string;
}

export interface Article {
  id: number;
  title: string;
  excerpt: string;
  link: string;
}

export interface SkillCategory {
  title: string;
  skills: string[];
  icon: any; // Using Lucide icons
}