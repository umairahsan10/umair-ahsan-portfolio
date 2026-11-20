import React from 'react';
import { motion } from 'framer-motion';
import { Github, Linkedin, Mail, Download } from 'lucide-react';
import { StaggerGroup, StaggerItem } from './ui/Section';
import { motionTokens } from '../lib/motion-tokens';

const ACTION_BASE =
  'group flex items-center gap-2 px-6 py-3 min-h-[44px] bg-[var(--color-elevated)] rounded-full border border-[var(--color-border)] text-gray-900 dark:text-white hover:text-white shadow-sm dark:shadow-none hover:shadow-lg active:scale-[0.97] transition-[background-color,color,border-color,box-shadow,transform] duration-150 ease-out cursor-pointer';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[var(--color-footer)] py-20 px-6 md:px-12 border-t border-[var(--color-border)] theme-transition">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-10">
          <StaggerGroup stagger={motionTokens.stagger.normal} className="flex flex-col">
            <motion.p
              variants={{
                hidden: { opacity: 0, x: -motionTokens.distance.md },
                visible: { opacity: 1, x: 0, transition: { duration: motionTokens.duration.normal, ease: motionTokens.easing.smooth } },
              }}
              className="font-mono text-gray-500 mb-4"
            >
              .../Contacts ...
            </motion.p>
            <motion.h2
              variants={{
                hidden: { opacity: 0, y: motionTokens.distance.lg },
                visible: { opacity: 1, y: 0, transition: { duration: motionTokens.duration.slow, ease: motionTokens.easing.smooth } },
              }}
              className="font-display text-5xl md:text-7xl font-bold mb-8 text-gray-900 dark:text-white theme-transition"
            >
              Let's work<br />together.
            </motion.h2>
            <StaggerItem className="flex flex-wrap gap-4">
              <a href="mailto:umairahsan2019@gmail.com" className={`${ACTION_BASE} hover:bg-gray-900 dark:hover:bg-white dark:hover:text-gray-900`}>
                <Mail className="w-4 h-4 group-hover:rotate-12 transition-transform duration-150 ease-out" aria-hidden="true" />
                <span className="font-medium">Email Me</span>
              </a>
              <a
                href="https://linkedin.com/in/umair-ahsan-650315250"
                target="_blank"
                rel="noopener noreferrer"
                className={`${ACTION_BASE} hover:bg-[var(--color-accent)] hover:shadow-blue-500/25`}
              >
                <Linkedin className="w-4 h-4 group-hover:rotate-12 transition-transform duration-150 ease-out" aria-hidden="true" />
                <span className="font-medium">LinkedIn</span>
              </a>
              <a
                href="/resume.pdf"
                download="Umair_Ahsan_Resume.pdf"
                aria-label="Download resume"
                className={`${ACTION_BASE} hover:bg-green-600 hover:shadow-green-500/25`}
              >
                <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform duration-150 ease-out" aria-hidden="true" />
                <span className="font-medium">Resume</span>
              </a>
            </StaggerItem>
          </StaggerGroup>

          <motion.div
            initial={{ opacity: 0, y: motionTokens.distance.md }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: motionTokens.duration.normal, ease: motionTokens.easing.smooth }}
            className="text-right"
          >
            <div className="font-mono text-sm text-gray-500 mb-2">Site</div>
            <div className="text-gray-600 dark:text-gray-300 theme-transition">Handcrafted by Umair Ahsan</div>
          </motion.div>
        </div>

        <div className="pt-8 border-t border-[var(--color-border)] flex flex-col md:flex-row justify-between items-center gap-4 theme-transition">
          <div className="font-display text-2xl font-bold tracking-tight text-gray-900 dark:text-white theme-transition">
            Umair <span className="text-gray-500">Ahsan</span>
          </div>

          <div className="flex gap-6">
            <a href="https://github.com/umairahsan10" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="flex items-center justify-center w-11 h-11 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors duration-150 ease-out cursor-pointer"><Github className="w-5 h-5" aria-hidden="true" /></a>
            <a href="https://linkedin.com/in/umair-ahsan-650315250" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="flex items-center justify-center w-11 h-11 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors duration-150 ease-out cursor-pointer"><Linkedin className="w-5 h-5" aria-hidden="true" /></a>
            <a href="mailto:umairahsan2019@gmail.com" aria-label="Email" className="flex items-center justify-center w-11 h-11 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors duration-150 ease-out cursor-pointer"><Mail className="w-5 h-5" aria-hidden="true" /></a>
          </div>

          <div className="text-xs text-gray-600 font-mono">
            © {new Date().getFullYear()}. All Rights Reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};
