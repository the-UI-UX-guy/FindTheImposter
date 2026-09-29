import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { useSettingsStore } from '../store/settingsStore';
import { motion, AnimatePresence } from 'framer-motion';

const steps = [
  {
    title: "1. Add Players",
    desc: "Gather your friends around one phone. Minimum 3 players.",
    animation: (
      <div className="flex space-x-2 justify-center">
        {[1, 2, 3].map(i => (
          <motion.div 
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.2, type: 'spring' }}
            className="w-12 h-12 bg-slate-500 rounded-full flex items-center justify-center text-white font-bold"
          >
            P{i}
          </motion.div>
        ))}
      </div>
    )
  },
  {
    title: "2. Secret Roles",
    desc: "Pass the phone. Everyone gets the Secret Word, except the Imposter!",
    animation: (
      <motion.div 
        animate={{ rotateY: [0, 180, 180, 0] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
        className="w-24 h-32 bg-[var(--color-brand-red)] rounded-xl mx-auto flex items-center justify-center text-white font-bold text-2xl"
      >
        ?
      </motion.div>
    )
  },
  {
    title: "3. Give Clues",
    desc: "Take turns giving a clue about the word. Imposter, blend in!",
    animation: (
      <div className="flex flex-col space-y-2 items-center">
        <motion.div 
          animate={{ x: [-20, 20, -20] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="bg-slate-500 px-4 py-2 rounded-xl text-white text-sm"
        >
          "It's hot..."
        </motion.div>
        <motion.div 
          animate={{ x: [20, -20, 20] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          className="bg-[var(--color-brand-red)] border border-red-300 px-4 py-2 rounded-xl text-white text-sm"
        >
          "Uh, yeah very hot."
        </motion.div>
      </div>
    )
  },
  {
    title: "4. Vote",
    desc: "Discuss and vote on who you think the Imposter is.",
    animation: (
      <div className="flex space-x-4 justify-center">
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="w-12 h-12 bg-[var(--color-brand-red)] rounded-full flex items-center justify-center text-white"
        >
          Vote
        </motion.div>
      </div>
    )
  }
];

export function HowToPlay() {
  const setPhase = useGameStore(state => state.setPhase);
  const { animationsEnabled } = useSettingsStore();
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setPhase('HOME');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col space-y-6 min-h-[80vh] relative">
      <div className="flex justify-center">
        <h2 className="text-3xl font-bold text-[var(--color-text-main)]">How To Play</h2>
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-12">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentStep}
            initial={animationsEnabled ? { opacity: 0, x: 50 } : { opacity: 1 }}
            animate={{ opacity: 1, x: 0 }}
            exit={animationsEnabled ? { opacity: 0, x: -50 } : { opacity: 0 }}
            transition={{ duration: animationsEnabled ? 0.3 : 0 }}
            className="bg-[var(--color-surface-card)] p-8 rounded-3xl border border-[var(--color-surface-border)] shadow-xl text-center space-y-8"
          >
            <div className="h-32 flex items-center justify-center">
              {animationsEnabled ? steps[currentStep].animation : (
                <div className="w-20 h-20 bg-[var(--color-brand-red)] rounded-xl flex items-center justify-center text-white text-3xl font-bold">
                  {currentStep + 1}
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-[var(--color-text-main)]">{steps[currentStep].title}</h3>
              <p className="text-[var(--color-text-muted)] leading-relaxed">{steps[currentStep].desc}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-between items-center px-4 pb-8">
        <div className="flex space-x-2">
          {steps.map((_, idx) => (
            <div 
              key={idx} 
              className={`w-2 h-2 rounded-full transition-all ${idx === currentStep ? 'bg-[var(--color-brand-red)] w-6' : 'bg-slate-300 dark:bg-slate-700'}`} 
            />
          ))}
        </div>
        
        <button 
          onClick={nextStep}
          className="px-8 py-3 bg-[var(--color-brand-red)] hover:bg-[var(--color-brand-red-hover)] text-white font-bold rounded-xl transition-all shadow-lg active:scale-95"
        >
          {currentStep === steps.length - 1 ? "GOT IT" : "NEXT"}
        </button>
      </div>
    </div>
  );
}
