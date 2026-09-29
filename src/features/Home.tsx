import { useGameStore } from '../store/gameStore';
import { useSettingsStore } from '../store/settingsStore';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, HelpCircle, Users } from 'lucide-react';
import { audioManager } from '../utils/audioManager';

export function Home() {
  const setPhase = useGameStore(state => state.setPhase);
  const { animationsEnabled } = useSettingsStore();

  const handleAction = (phase: 'SETUP' | 'HOW_TO_PLAY' | 'SETTINGS' | 'ONLINE_LANDING') => {
    audioManager.playSelect();
    setPhase(phase);
  };

  return (
    <div className="w-full flex-1 flex flex-col justify-between max-w-md mx-auto pt-8 pb-12">
      
      {/* Header section */}
      <motion.div 
        className="text-center space-y-3 mt-6"
        initial={animationsEnabled ? { opacity: 0, y: -20 } : {}}
        animate={animationsEnabled ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-5xl font-black text-[var(--color-text-main)] tracking-widest uppercase glitch-logo text-glow" data-text="IMPOSTER">
          IMPOSTER
        </h1>
        <p className="text-[var(--color-text-muted)] tracking-widest uppercase text-sm font-semibold">
          Who doesn't know the word?
        </p>
      </motion.div>

      {/* Hero Image / Centerpiece */}
      <motion.div 
        className="flex-1 flex flex-col items-center justify-center py-10 relative"
        initial={animationsEnabled ? { opacity: 0, scale: 0.95 } : {}}
        animate={animationsEnabled ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="absolute w-64 h-64 bg-[var(--color-brand-red)] rounded-full blur-[100px] opacity-10 pointer-events-none" />
        
        <div className="relative w-full max-w-[280px] aspect-[4/5] rounded-3xl overflow-hidden glass-panel border border-[var(--color-surface-border)] shadow-2xl">
          <img 
            src="/hero-bg.jpg" 
            alt="Imposter" 
            className="w-full h-full object-cover opacity-90 object-top mix-blend-screen"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-surface-card)] via-transparent to-transparent" />
        </div>
        
        <motion.p 
          className="mt-8 text-xl text-[var(--color-text-main)] font-medium"
          animate={animationsEnabled ? { opacity: [0.7, 1, 0.7] } : {}}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          Ready to find the liar?
        </motion.p>
      </motion.div>

      {/* Actions */}
      <motion.div 
        className="space-y-4 px-4 w-full"
        initial={animationsEnabled ? { opacity: 0, y: 20 } : {}}
        animate={animationsEnabled ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="flex flex-col space-y-3 w-full">
          <button 
            onClick={() => handleAction('ONLINE_LANDING')}
            className="relative w-full py-5 bg-gradient-to-r from-[var(--color-brand-blue)] to-[var(--color-brand-blue-hover)] text-white font-black rounded-2xl text-xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] active:scale-[0.98] overflow-hidden group flex items-center justify-center space-x-2"
          >
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
            <span className="text-2xl">🌐</span>
            <span>PLAY ONLINE</span>
          </button>

          <button 
            onClick={() => handleAction('SETUP')}
            className="relative w-full py-4 bg-gradient-to-r from-[var(--color-brand-red)] to-[var(--color-brand-red-hover)] text-white font-black rounded-2xl text-lg transition-all shadow-lg hover:shadow-red-900/50 active:scale-[0.98] box-glow overflow-hidden group flex items-center justify-center space-x-2"
          >
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
            <span className="text-xl">📱</span>
            <span>PASS & PLAY</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        <div className="flex space-x-3 w-full">
          <button 
            onClick={() => handleAction('HOW_TO_PLAY')}
            className="flex-1 py-4 bg-[var(--color-surface-card)] hover:bg-[var(--color-surface-border)] text-[var(--color-text-main)] font-semibold rounded-2xl transition-colors border border-[var(--color-surface-border)] flex items-center justify-center space-x-2 active:scale-95"
          >
            <HelpCircle size={20} className="text-[var(--color-text-muted)]" />
            <span>How to Play</span>
          </button>
          
          <button 
            onClick={() => handleAction('SETTINGS')}
            className="flex-1 py-4 bg-[var(--color-surface-card)] hover:bg-[var(--color-surface-border)] text-[var(--color-text-main)] font-semibold rounded-2xl transition-colors border border-[var(--color-surface-border)] flex items-center justify-center space-x-2 active:scale-95"
          >
            <SettingsIcon size={20} className="text-[var(--color-text-muted)]" />
            <span>Settings</span>
          </button>
        </div>

        <div className="flex items-center justify-center text-[var(--color-text-muted)] text-sm font-medium mt-6 pt-4 space-x-2">
          <Users size={16} />
          <span>3–20 Players</span>
          <span className="mx-2 opacity-50">•</span>
          <span>Party Game</span>
        </div>
      </motion.div>
    </div>
  );
}
