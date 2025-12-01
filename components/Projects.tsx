import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Section, SectionTitle } from "./ui/Section";
import { Project } from "../types";

const projects: Project[] = [
  {
    id: 1,
    title: "CRM Platform",
    description:
      "An enterprise CRM with real-time chat, Kanban boards, analytics dashboards, multi-department workflows, and automated reporting.",
    tech: ["Next.js", "Nest.js", "PostgreSQL", "Prisma", "Supabase"],
    image: "projects/crm.png",
    link: "https://crm-frontend-eight-gamma.vercel.app/",
  },
  {
    id: 2,
    title: "IntelliMaint AI",
    description:
      "AI-powered maintenance assistant that generates step-by-step troubleshooting guides from images and voice commands.",
    tech: ["Next.js", "OpenAI APIs", "Voice Input", "Image Recognition"],
    image: "projects/intellimaint.png",
    link: "https://intellimaint-ai.vercel.app/",
  },
  {
    id: 3,
    title: "Email Automation System",
    description:
      "Scrapes websites → detects problems → generates personalized emails → sends at scale (50k–90k emails). Includes tracking and follow-up automation.",
    tech: ["Next.js", "Node.js", "OpenAI APIs", "Automation"],
    image: "projects/email-automation.png",
    link: "http://email-frontend-bytes.vercel.app/",
  },
  {
    id: 4,
    title: "VerticalWorx",
    description:
      "Aviation sales & operations platform with analytics, dashboards, lead tracking, and automated reporting.",
    tech: ["Next.js", "PostgreSQL", "Prisma"],
    image: "projects/vertical-worx.png",
    link: "https://verticalworx.aero/",
  },
  {
    id: 5,
    title: "BytesPlatform Website",
    description:
      "Highly animated marketing site with scroll-triggered effects and 3D visuals.",
    tech: ["Next.js", "Tailwind", "Framer Motion", "@react-three/fiber"],
    image: "projects/bytes-website.png",
    link: "http://bytesplatform.com/",
  },
  {
    id: 6,
    title: "IndigoTG Website",
    description:
      "Corporate website with clean UI and responsive layout for a trading & logistics company.",
    tech: ["Next.js", "Tailwind CSS"],
    image: "projects/indigotg.png",
    link: "https://indigotg.vercel.app/",
  },
];

export const Projects: React.FC = () => {
  return (
    <Section id="projects" className="py-12 md:py-16">
      <SectionTitle subtitle="Projects">Selected Work</SectionTitle>

      <div className="space-y-20 md:space-y-32">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className={`flex flex-col ${
              index % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"
            } gap-12 items-center`}
          >
            {/* Image Side */}
            <div className="w-full md:w-3/5 group cursor-pointer relative">
              <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
              <div className="relative overflow-hidden rounded-2xl border border-gray-400 dark:border-white/10 bg-white dark:bg-[#1A1A1A] shadow-lg dark:shadow-none transition-all duration-500">
                <div className="aspect-[190/100] md:aspect-[205/100] w-full overflow-hidden bg-gray-50 dark:bg-[#0A0A0A]">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-contain object-bottom transform group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                {/* Overlay UI elements */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
              </div>
            </div>

            {/* Content Side */}
            <div className="w-full md:w-2/5">
              <h3 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white transition-colors duration-500">
                {project.title}
              </h3>

              <div className="flex flex-wrap gap-2 mb-6">
                {project.tech.map((t) => (
                  <span
                    key={t}
                    className="px-3 py-1 rounded-full bg-gray-100 dark:bg-[#252525] border border-gray-400 dark:border-white/5 text-xs font-mono text-gray-600 dark:text-gray-400 transition-colors duration-500"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed transition-colors duration-500">
                {project.description}
              </p>

              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-black rounded-full font-medium hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors group"
              >
                View Project
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
};
