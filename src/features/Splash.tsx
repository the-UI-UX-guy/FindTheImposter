import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashProps {
  onComplete: () => void;
}

export function Splash({ onComplete }: SplashProps) {
  const [showSubtitle, setShowSubtitle] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSubtitle(true);
    }, 1000);
    
    const finish = setTimeout(() => {
      onComplete();
    }, 2800);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(finish);
    };
  }, [onComplete]);

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#070709]"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
    >
      <div className="absolute inset-0">
        <motion.div 
          className="w-full h-full bg-cover bg-center opacity-40"
          style={{ backgroundImage: 'url(/hero-bg.jpg)' }}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 4, ease: "easeOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-transparent to-[#070709] opacity-80" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center space-y-6">
        <motion.h1 
          className="text-6xl md:text-7xl font-black text-white tracking-widest uppercase glitch-logo text-glow"
          data-text="IMPOSTER"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          IMPOSTER
        </motion.h1>

        <AnimatePresence>
          {showSubtitle && (
            <motion.p
              initial={{ opacity: 0, filter: 'blur(10px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              className="text-lg md:text-xl text-[var(--color-brand-red)] font-medium tracking-widest uppercase"
            >
              Who doesn't know the word?
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
