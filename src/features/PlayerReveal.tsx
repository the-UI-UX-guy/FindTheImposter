import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { useSettingsStore } from '../store/settingsStore';
import { motion, AnimatePresence } from 'framer-motion';
import { audioManager } from '../utils/audioManager';
import { Eye, EyeOff, Shield, Skull } from 'lucide-react';

export function PlayerReveal() {
  const { players, currentPlayerIndex, secretWord, hintWord, imposters, setPhase, settings } = useGameStore();
  const { animationsEnabled } = useSettingsStore();
  
  const [revealed, setRevealed] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [showContent, setShowContent] = useState(false);

  const currentPlayer = players[currentPlayerIndex];
  const isImposter = imposters.includes(currentPlayer?.id);

  // When card is fully revealed, show the text content
  useEffect(() => {
    if (revealed) {
      const timer = setTimeout(() => setShowContent(true), animationsEnabled ? 300 : 0);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [revealed, animationsEnabled]);

  const handleReveal = () => {
    if (!revealed && !isFlipping) {
      audioManager.playCardFlip();
      setIsFlipping(true);
      setRevealed(true);
      setTimeout(() => setIsFlipping(false), animationsEnabled ? 600 : 0);
      
      // Dramatic sound for imposter, nice sound for civilian
      if (isImposter) {
        setTimeout(() => audioManager.playImposterReveal(), animationsEnabled ? 300 : 0);
      } else {
        setTimeout(() => audioManager.playVoteReveal(), animationsEnabled ? 300 : 0);
      }
    }
  };

  const handleNext = () => {
    if (revealed && !isFlipping) {
      audioManager.playCardFlip();
      setIsFlipping(true);
      setRevealed(false);
      
      setTimeout(() => {
        setIsFlipping(false);
        if (currentPlayerIndex < players.length - 1) {
          useGameStore.setState({ currentPlayerIndex: currentPlayerIndex + 1 });
        } else {
          setPhase('CLUE_INTRO');
        }
      }, animationsEnabled ? 600 : 0);
    }
  };

  if (!currentPlayer) return null;

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center min-h-[85vh] relative z-10 px-4">
      
      {/* Dynamic Background effect based on role when revealed */}
      <AnimatePresence>
        {revealed && isImposter && (
          <motion.div 
            initial={animationsEnabled ? { opacity: 0 } : {}}
            animate={animationsEnabled ? { opacity: 1 } : {}}
            exit={animationsEnabled ? { opacity: 0 } : {}}
            transition={{ duration: 1 }}
            className="fixed inset-0 bg-red-950/40 pointer-events-none -z-10 flex items-center justify-center"
          >
            <div className="absolute w-[150vw] h-[150vh] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/30 via-transparent to-transparent opacity-60 pointer-events-none mix-blend-screen" />
          </motion.div>
        )}
        {revealed && !isImposter && (
          <motion.div 
            initial={animationsEnabled ? { opacity: 0 } : {}}
            animate={animationsEnabled ? { opacity: 1 } : {}}
            exit={animationsEnabled ? { opacity: 0 } : {}}
            transition={{ duration: 1 }}
            className="fixed inset-0 bg-blue-950/20 pointer-events-none -z-10"
          >
            <div className="absolute w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent opacity-60 pointer-events-none mix-blend-screen" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full h-[550px] [perspective:1200px]">
        <motion.div 
          className="w-full h-full relative [transform-style:preserve-3d]"
          animate={{ rotateY: revealed ? 180 : 0 }}
          transition={{ duration: animationsEnabled ? 0.6 : 0, type: 'spring', stiffness: 60, damping: 12 }}
        >
          {/* CARD FRONT (Face Down) */}
          <div 
            className="absolute inset-0 w-full h-full [backface-visibility:hidden] glass-panel border border-[var(--color-surface-border)] rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer shadow-2xl hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] transition-all"
            onClick={handleReveal}
          >
            <div className="flex-1 flex flex-col items-center justify-center space-y-6">
              <EyeOff size={48} className="text-[var(--color-text-muted)] opacity-50" />
              <div className="text-center space-y-2">
                <p className="text-[var(--color-text-muted)] text-sm tracking-widest uppercase font-bold">Pass the phone to</p>
                <h2 className="text-4xl font-black text-[var(--color-text-main)] truncate max-w-[250px]">{currentPlayer.name}</h2>
              </div>
            </div>
            
            <div className="w-full py-4 bg-[var(--color-surface-bg)] text-[var(--color-text-main)] border border-[var(--color-surface-border)] font-bold rounded-2xl text-lg mt-8 text-center uppercase tracking-wider animate-pulse shadow-inner">
              Tap to Reveal
            </div>
          </div>

          {/* CARD BACK (Face Up) */}
          <div 
            className={`absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-3xl p-8 flex flex-col items-center justify-between shadow-2xl border ${
              isImposter 
                ? 'bg-[var(--bg-secondary)] border-[var(--color-brand-red)] shadow-[0_0_40px_rgba(225,29,72,0.2)]' 
                : 'glass-panel border-[var(--color-brand-blue)]/50 shadow-[0_0_40px_rgba(59,130,246,0.15)]'
            }`}
          >
            <div className="text-center w-full mt-4">
              <p className="text-[var(--color-text-muted)] font-bold tracking-widest uppercase text-sm mb-1">{currentPlayer.name}, you are</p>
              
              <AnimatePresence>
                {showContent && (
                  <motion.div
                    initial={animationsEnabled ? { opacity: 0, scale: 0.9, y: 10 } : {}}
                    animate={animationsEnabled ? { opacity: 1, scale: 1, y: 0 } : {}}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col items-center"
                  >
                    {isImposter ? (
                      <>
                        <Skull size={48} className="text-[var(--color-brand-red)] mb-4" />
                        <h2 className="text-5xl font-black text-[var(--color-brand-red)] tracking-wide uppercase text-glow mb-6">
                          THE IMPOSTER
                        </h2>
                        <div className="bg-[var(--color-surface-bg)] border border-[var(--color-brand-red)]/30 w-full py-6 rounded-2xl">
                          <p className="text-[var(--color-text-muted)]">You don't know the word.</p>
                          <p className="text-[var(--color-text-main)] font-semibold mt-1">Blend in. Survive.</p>
                        </div>
                        
                        {settings.imposterHint && (
                          <div className="mt-6 w-full text-center">
                            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-widest mb-2">Category Hint</p>
                            <p className="text-xl font-bold text-yellow-500 bg-yellow-500/10 py-3 rounded-xl border border-yellow-500/20">{hintWord}</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <Shield size={48} className="text-[var(--color-brand-blue)] mb-4" />
                        <h2 className="text-4xl font-black text-[var(--color-brand-blue)] tracking-wide uppercase mb-6 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                          CIVILIAN
                        </h2>
                        <div className="bg-[var(--color-surface-bg)] border border-[var(--color-surface-border)] w-full py-6 rounded-2xl shadow-inner">
                          <p className="text-[var(--color-text-muted)] text-sm mb-2 uppercase tracking-widest">The Secret Word is</p>
                          <p className="text-4xl font-black text-[var(--color-text-main)] tracking-wider">{secretWord}</p>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button 
              onClick={handleNext}
              className={`w-full py-5 font-black rounded-2xl text-xl transition-all active:scale-[0.98] shadow-lg flex items-center justify-center space-x-2 ${
                isImposter 
                  ? 'bg-gradient-to-r from-[var(--color-brand-red)] to-[var(--color-brand-red-hover)] text-white box-glow' 
                  : 'bg-[var(--color-surface-bg)] text-[var(--color-text-main)] border border-[var(--color-surface-border)] hover:bg-[var(--color-surface-border)]'
              }`}
            >
              <Eye size={20} className={isImposter ? 'text-white' : 'text-[var(--color-text-muted)]'} />
              <span>HIDE ROLE</span>
            </button>
          </div>
        </motion.div>
      </div>

      <div className="mt-8 flex space-x-2">
        {players.map((_, i) => (
          <div 
            key={i} 
            className={`w-2 h-2 rounded-full transition-all duration-300 ${i === currentPlayerIndex ? 'bg-[var(--color-text-main)] w-6' : 'bg-[var(--color-surface-border)]'}`}
          />
        ))}
      </div>
    </div>
  );
}
