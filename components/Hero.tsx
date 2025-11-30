import React from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Github, Linkedin, Mail, Code2, Database, Layout, Globe, Cpu, Server } from 'lucide-react';

export const Hero: React.FC = () => {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  // Mouse parallax effect setup
  const mouseX = useSpring(0, { stiffness: 25, damping: 20 });
  const mouseY = useSpring(0, { stiffness: 25, damping: 20 });

  function onMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const xPoint = (clientX - left) / width;
    const yPoint = (clientY - top) / height;
    const xOffset = xPoint - 0.5;
    const yOffset = yPoint - 0.5;

    mouseX.set(xOffset * 10); // Tilt amount X
    mouseY.set(yOffset * 10); // Tilt amount Y
  }

  return (
    <section 
      id="home" 
      className="min-h-screen flex flex-col relative overflow-hidden pt-16 md:pt-24 pb-4 md:pb-8 transition-colors duration-500"
      onMouseMove={onMouseMove}
    >
      
      {/* Background - Minimalist Void */}
      <div className="absolute inset-0 bg-gray-50 dark:bg-[#0a0a0a] z-0 transition-colors duration-500">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-100/50 via-gray-50 to-gray-50 dark:from-blue-900/20 dark:via-[#0a0a0a] dark:to-[#0a0a0a] transition-all duration-500"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-black/5 dark:via-white/5 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-black/5 dark:via-white/5 to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full flex-grow flex flex-col justify-center">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          {/* Left: Typography */}
          <motion.div 
            style={{ opacity }}
            className="flex flex-col z-20"
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3 mb-6"
            >
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="font-mono text-sm text-green-600 dark:text-green-400 tracking-wider font-semibold">AVAILABLE FOR HIRE</span>
            </motion.div>

            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-bold tracking-tighter leading-[1.1] mb-4 md:mb-6 text-gray-900 dark:text-white transition-colors duration-500">
              <motion.span 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="block"
              >
                Full-Stack
              </motion.span>
              <motion.span 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="block text-transparent bg-clip-text bg-gradient-to-r from-gray-700 via-gray-900 to-gray-500 dark:from-white dark:via-white dark:to-gray-500 transition-all duration-500"
              >
                Developer
              </motion.span>
            </h1>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-gray-600 dark:text-gray-400 text-sm md:text-base lg:text-lg max-w-lg leading-relaxed mb-4 md:mb-6 transition-colors duration-500"
            >
              I build scalable full-stack applications, AI-powered automation tools, enterprise dashboards, and pixel-perfect user experiences.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex items-center gap-6"
            >
              <SocialLink href="https://github.com/umairahsan10" icon={Github} />
              <SocialLink href="https://linkedin.com/in/umair-ahsan-650315250" icon={Linkedin} />
              <SocialLink href="mailto:umairahsan2019@gmail.com" icon={Mail} />
            </motion.div>
          </motion.div>

          {/* Right: Orbital Tech System */}
          <div className="relative h-[200px] md:h-[280px] lg:h-[400px] w-full flex items-center justify-center perspective-[1000px]">
             
             <motion.div
               style={{ rotateX: mouseY, rotateY: mouseX }}
               className="relative w-full h-full flex items-center justify-center"
             >
                {/* Core */}
                <motion.div
                   initial={{ scale: 0, opacity: 0 }}
                   animate={{ scale: 1, opacity: 1 }}
                   transition={{ duration: 1, delay: 0.5 }}
                   className="relative w-24 h-24 md:w-32 md:h-32 rounded-full bg-white dark:bg-black border border-black/10 dark:border-white/10 flex items-center justify-center z-20 shadow-[0_0_50px_-10px_rgba(59,130,246,0.5)] transition-colors duration-500"
                >
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/20 to-purple-500/20 animate-pulse"></div>
                    <Code2 className="w-8 h-8 md:w-12 md:h-12 text-gray-900 dark:text-white relative z-10 transition-colors duration-500" />
                    
                    {/* Inner spinning ring */}
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-2 rounded-full border border-dashed border-black/10 dark:border-white/20 transition-colors duration-500"
                    />
                </motion.div>

                {/* Orbit 1 */}
                <OrbitRing 
                  className="w-[80px] h-[80px] md:w-[110px] md:h-[110px] lg:w-[170px] lg:h-[170px]"
                  duration={20} 
                  delay={0}
                >
                    <OrbitIcon icon={Layout} angle={0} />
                    <OrbitIcon icon={Globe} angle={120} />
                    <OrbitIcon icon={Cpu} angle={240} />
                </OrbitRing>

                {/* Orbit 2 */}
                <OrbitRing 
                  className="w-[120px] h-[120px] md:w-[170px] md:h-[170px] lg:w-[240px] lg:h-[240px]"
                  duration={35} 
                  delay={-5} 
                >
                    <OrbitIcon icon={Database} angle={45} isOuterOrbit={true} />
                    <OrbitIcon icon={Server} angle={165} isOuterOrbit={true} />
                    <OrbitIcon icon={Github} angle={285} isOuterOrbit={true} />
                </OrbitRing>

                {/* Decorative Particles/Glows */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120px] h-[120px] md:w-[200px] md:h-[200px] lg:w-[400px] lg:h-[400px] bg-blue-500/5 dark:bg-blue-600/5 rounded-full blur-[20px] md:blur-[30px] lg:blur-[60px] -z-10 pointer-events-none transition-colors duration-500"></div>
             </motion.div>

          </div>

        </div>

        {/* Scroll Indicator */}
        <motion.div 
          style={{ opacity }}
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-400 dark:text-gray-500 transition-colors duration-500"
        >
          <span className="text-[10px] uppercase tracking-widest">Scroll</span>
          <div className="w-[1px] h-8 bg-gradient-to-b from-gray-400 to-transparent dark:from-gray-500"></div>
        </motion.div>

      </div>
    </section>
  );
};

const SocialLink: React.FC<{ icon: any; href: string }> = ({ icon: Icon, href }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-12 h-12 rounded-full border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/5 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black hover:scale-110 transition-all duration-300 text-gray-700 dark:text-gray-300">
    <Icon className="w-5 h-5" />
  </a>
);

const OrbitRing: React.FC<{ className?: string; duration: number; delay: number; reverse?: boolean; children: React.ReactNode }> = ({ className, duration, delay, reverse, children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1, rotate: reverse ? -360 : 360 }}
      transition={{ 
        opacity: { duration: 1, delay: 0.2 },
        scale: { duration: 1, delay: 0.2 },
        rotate: { duration: duration, repeat: Infinity, ease: "linear", delay: delay }
      }}
      className={`absolute rounded-full border border-black/5 dark:border-white/5 flex items-center justify-center transition-colors duration-500 ${className}`}
    >
      {children}
    </motion.div>
  );
}

const OrbitIcon: React.FC<{ icon: any; angle: number; isOuterOrbit?: boolean }> = ({ icon: Icon, angle, isOuterOrbit = false }) => {
   const mobileDistance = isOuterOrbit ? '[190%]' : '[150%]';
   const smDistance = isOuterOrbit ? '[160%]' : '[120%]';
   const mdDistance = isOuterOrbit ? '[90%]' : '[80%]';
   
   return (
     <div 
       className="absolute top-1/2 left-1/2"
       style={{ 
         width: '100%',
         height: '100%',
         transform: `translate(-50%, -50%) rotate(${angle}deg)`,
         pointerEvents: 'none'
       }}
     >
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-${mobileDistance} sm:-translate-y-${smDistance} md:-translate-y-${mdDistance} pointer-events-auto transform hover:scale-110 transition-transform`}>
           <div className="w-8 h-8 md:w-10 md:h-10 bg-white dark:bg-[#121212] border border-black/10 dark:border-white/20 rounded-full flex items-center justify-center text-black dark:text-gray-400 hover:text-black dark:hover:text-white hover:border-black dark:hover:border-white transition-colors shadow-[0_0_15px_-5px_rgba(0,0,0,0.1)] dark:shadow-[0_0_15px_-5px_rgba(255,255,255,0.2)]">
              <Icon className="w-4 h-4 md:w-5 md:h-5" />
           </div>
        </div>
     </div>
   )
}