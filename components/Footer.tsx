import React from 'react';
import { Github, Linkedin, Mail, Send } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 dark:bg-[#0A0A0A] py-20 px-6 md:px-12 border-t border-black/5 dark:border-white/5 transition-colors duration-500">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-10">
          <div>
            <p className="font-mono text-gray-500 mb-4">.../Contacts ...</p>
            <h2 className="text-5xl md:text-7xl font-bold mb-8 text-gray-900 dark:text-white transition-colors duration-500">
              Let's work<br />together.
            </h2>
            <div className="flex flex-wrap gap-4">
               <a href="mailto:umairahsan2019@gmail.com" className="group flex items-center gap-2 px-6 py-3 bg-white dark:bg-[#1E1E1E] rounded-full hover:bg-gray-900 dark:hover:bg-white hover:text-white dark:hover:text-gray-900 transition-all duration-300 ease-out border border-black/5 dark:border-white/5 text-gray-900 dark:text-white shadow-sm dark:shadow-none hover:shadow-lg hover:scale-105 hover:-translate-y-0.5">
                 <Mail className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                 <span className="font-medium">Email Me</span>
               </a>
               <a href="https://linkedin.com/in/umair-ahsan-650315250" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2 px-6 py-3 bg-white dark:bg-[#1E1E1E] rounded-full hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white transition-all duration-300 ease-out border border-black/5 dark:border-white/5 text-gray-900 dark:text-white shadow-sm dark:shadow-none hover:shadow-lg hover:shadow-blue-500/25 hover:scale-105 hover:-translate-y-0.5">
                 <Linkedin className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                 <span className="font-medium">LinkedIn</span>
               </a>
            </div>
          </div>

          <div className="text-right">
             <div className="font-mono text-sm text-gray-500 mb-2">Site</div>
             <div className="text-gray-600 dark:text-gray-300 transition-colors duration-500">Handcrafted by Umair Ahsan /</div>
             <div className="text-gray-600 dark:text-gray-300 transition-colors duration-500">Powered by React</div>
          </div>
        </div>

        <div className="pt-8 border-t border-black/5 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 transition-colors duration-500">
          <div className="text-2xl font-bold tracking-tighter text-gray-900 dark:text-white transition-colors duration-500">
            Umair <span className="text-gray-500">Ahsan</span>
          </div>
          
          <div className="flex gap-6">
            <a href="https://github.com/umairahsan10" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-black dark:hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
            <a href="https://linkedin.com/in/umair-ahsan-650315250" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-black dark:hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
            <a href="mailto:umairahsan2019@gmail.com" className="text-gray-500 hover:text-black dark:hover:text-white transition-colors"><Mail className="w-5 h-5" /></a>
          </div>

          <div className="text-xs text-gray-600 font-mono">
            © 2025. All Rights Reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};