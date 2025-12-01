import React from 'react';
import { motion } from 'framer-motion';
import { Section, SectionTitle } from './ui/Section';

export const About: React.FC = () => {
  return (
    <Section id="about" className="py-12 md:py-16">
      <SectionTitle subtitle="About me">Who I Am</SectionTitle>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
           <h3 className="text-xl md:text-2xl lg:text-3xl font-light leading-snug mb-4 md:mb-6 text-gray-800 dark:text-gray-100 transition-colors duration-500">
            Hello! I'm Umair. I'm a <span className="font-bold text-black dark:text-white">Full-Stack Developer</span> building enterprise platforms and AI automation systems.
          </h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6 transition-colors duration-500">
            I specialize in crafting robust, scalable, and high-performance web applications using Next.js, Nest.js, React, PostgreSQL, and TypeScript.
          </p>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6 transition-colors duration-500">
            My strengths include designing clean architectures, developing efficient APIs, implementing authentication/RBAC, building UI/UX with smooth animations, and delivering production-ready, maintainable code.
          </p>
          <div className="flex gap-4 font-mono text-sm">
            <span className="px-3 py-1 rounded-full border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 transition-colors duration-500">Remote</span>
            <span className="px-3 py-1 rounded-full border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 transition-colors duration-500">Relocation Available</span>
          </div>
        </motion.div>

        <motion.div 
          className="relative max-h-[220px] md:max-h-[150px] lg:max-h-[180px] max-w-full md:max-w-[70%] lg:max-w-[80%] md:-mt-28"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative z-10 rounded-2xl overflow-hidden grayscale hover:grayscale-0 transition-all duration-500 shadow-xl">
            <img 
              src="https://picsum.photos/seed/developer_umair/400/400" 
              alt="Umair Ahsan" 
              className="w-full h-full object-cover"
            />
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 dark:from-[#121212] via-transparent to-transparent opacity-60"></div>
          </div>
          
          {/* Decorative Backdrops */}
          <div className="absolute -top-4 -right-4 w-full h-full border border-gray-200 dark:border-gray-800 rounded-2xl -z-10 transition-colors duration-500"></div>
        </motion.div>
      </div>
    </Section>
  );
};