import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Calendar, Clock } from 'lucide-react';
import { Section, SectionTitle } from './ui/Section';
import { Article } from '../types';

const articles: Article[] = [
  {
    id: 1,
    title: 'Scalable Architecture with NestJS',
    excerpt: 'Deep dive into building enterprise-grade microservices and modular monoliths using NestJS and PostgreSQL.',
    link: '#'
  },
  {
    id: 2,
    title: 'Automating Workflows with OpenAI',
    excerpt: 'How to leverage AI to automate complex business processes, from web scraping to personalized email generation.',
    link: '#'
  },
  {
    id: 3,
    title: 'Next.js 14 & Server Actions',
    excerpt: 'Exploring the latest features in Next.js and how Server Actions simplify data mutation and improve performance.',
    link: '#'
  },
  {
    id: 4,
    title: 'Optimizing PostgreSQL Queries',
    excerpt: 'Best practices for database indexing, query optimization, and managing large datasets in enterprise applications.',
    link: '#'
  }
];

export const Articles: React.FC = () => {
  return (
    <Section id="articles" className="py-12 md:py-16">
      <SectionTitle subtitle="Writing">Articles</SectionTitle>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {articles.map((article, index) => (
          <motion.a
            key={article.id}
            href={article.link}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -8 }}
            className="group relative flex flex-col justify-between h-full min-h-[280px] p-8 rounded-[2rem] bg-white dark:bg-[#181818] border border-black/5 dark:border-white/5 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-blue-900/10"
          >
            {/* Hover Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-transparent dark:from-blue-900/10 dark:via-transparent dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6 text-xs font-mono text-gray-400 dark:text-gray-500">
                 <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Recent</span>
                 </div>
                 <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                 <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>5 min read</span>
                 </div>
              </div>

              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                {article.title}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6 line-clamp-3">
                {article.excerpt}
              </p>
            </div>
            
            <div className="relative z-10 flex items-center justify-between pt-6 border-t border-gray-100 dark:border-white/5 mt-auto">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                <BookOpen className="w-4 h-4" />
                <span>Read Article</span>
              </div>
              
              <motion.div 
                className="w-10 h-10 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-blue-600 dark:group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300"
              >
                <ArrowRight className="w-4 h-4 transform group-hover:-rotate-45 transition-transform duration-300" />
              </motion.div>
            </div>
          </motion.a>
        ))}
      </div>
    </Section>
  );
};