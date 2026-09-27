import { useState, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { useSettingsStore } from '../store/settingsStore';
import { audioManager } from '../utils/audioManager';
import { motion, AnimatePresence } from 'framer-motion';
import { Skull, Shield } from 'lucide-react';

export function Results() {
  const { players, votes, secretWord, setPhase, imposters } = useGameStore();
  const { animationsEnabled } = useSettingsStore();
  const [step, setStep] = useState<0 | 1 | 2>(0);

  const results = useMemo(() => {
    const tally: Record<string, number> = {};
    Object.values(votes).forEach(votedId => {
      tally[votedId] = (tally[votedId] || 0) + 1;
    });

    let maxVotes = 0;
    let eliminatedIds: string[] = [];

    Object.entries(tally).forEach(([id, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        eliminatedIds = [id];
      } else if (count === maxVotes) {
        eliminatedIds.push(id);
      }
    });

    const isImposterEliminated = eliminatedIds.some(id => imposters.includes(id));

    return { tally, eliminatedIds, maxVotes, isImposterEliminated };
  }, [votes, imposters]);

  const handleNext = () => {
    if (step === 0) {
      if (results.isImposterEliminated) {
        audioManager.playImposterReveal();
      } else {
        audioManager.playVoteReveal();
      }
      setStep(1);
    }
    else if (step === 1) {
      if (results.isImposterEliminated) {
        setPhase('FINAL_GUESS');
      } else {
        audioManager.playTimeUp();
        setStep(2); 
      }
    } else {
      useGameStore.getState().resetGame();
    }
  };

  const renderElimination = () => {
    const sortedPlayers = [...players].sort((a, b) => (results.tally[b.id] || 0) - (results.tally[a.id] || 0));

    return (
      <div className="space-y-8 w-full text-left">
        {step === 0 && (
          <motion.div 
            className="glass-panel rounded-3xl p-6 border border-[var(--color-surface-border)] shadow-xl space-y-5 mb-8 relative overflow-hidden"
            initial={animationsEnabled ? { opacity: 0, y: 20 } : {}}
            animate={animationsEnabled ? { opacity: 1, y: 0 } : {}}
          >
            <h4 className="text-sm font-bold text-[var(--color-text-muted)] uppercase tracking-[0.2em] text-center mb-6">Voting Results</h4>
            {sortedPlayers.map((p, idx) => {
              const votes = results.tally[p.id] || 0;
              if (votes === 0) return null;
              
              const isEliminated = results.eliminatedIds.includes(p.id);
              
              return (
                <motion.div 
                  key={p.id} 
                  className="flex items-center justify-between"
                  initial={animationsEnabled ? { opacity: 0, x: -20 } : {}}
                  animate={animationsEnabled ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: idx * 0.1 }}
                >
                  <span className={`font-bold truncate max-w-[120px] ${isEliminated ? 'text-[var(--color-brand-red)]' : 'text-[var(--color-text-main)]'}`}>{p.name}</span>
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      {Array.from({ length: votes }).map((_, i) => (
                        <motion.div 
                          key={i} 
                          initial={animationsEnabled ? { scale: 0 } : {}}
                          animate={animationsEnabled ? { scale: 1 } : {}}
                          transition={{ delay: (idx * 0.1) + (i * 0.1) }}
                          className={`h-3 w-3 rounded-sm ${isEliminated ? 'bg-[var(--color-brand-red)] shadow-[0_0_10px_rgba(225,29,72,0.5)]' : 'bg-[var(--color-text-muted)] opacity-50'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-[var(--color-text-muted)] text-xs w-14 text-right font-medium">{votes} vote{votes !== 1 && 's'}</span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        <div className="text-center space-y-6 pt-4">
          {results.eliminatedIds.length > 1 ? (
            <motion.div
              initial={animationsEnabled ? { scale: 0.9, opacity: 0 } : {}}
              animate={animationsEnabled ? { scale: 1, opacity: 1 } : {}}
            >
              <h3 className={`text-3xl font-black text-amber-500 tracking-widest uppercase text-glow ${animationsEnabled ? 'animate-pulse' : ''}`}>⚠️ IT'S A TIE</h3>
              <p className="text-[var(--color-text-muted)] mt-2 font-medium">Between {results.eliminatedIds.map(id => players.find(p => p.id === id)?.name).join(' and ')}</p>
            </motion.div>
          ) : (
            <>
              <h3 className="text-5xl font-black text-[var(--color-text-main)] truncate">{players.find(p => p.id === results.eliminatedIds[0])?.name}</h3>
              <p className="text-xl text-[var(--color-text-muted)] font-medium tracking-widest uppercase">was...</p>
              
              <AnimatePresence>
                {step === 1 && (
                  <motion.div 
                    initial={animationsEnabled ? { opacity: 0, scale: 0.5, y: 20 } : {}}
                    animate={animationsEnabled ? { opacity: 1, scale: 1, y: 0 } : {}}
                    transition={{ type: "spring", bounce: 0.5 }}
                    className="flex flex-col items-center justify-center pt-4"
                  >
                    {results.isImposterEliminated ? (
                      <>
                        <Skull size={48} className="text-[var(--color-brand-red)] mb-4" />
                        <h2 className="text-5xl font-black text-[var(--color-brand-red)] tracking-widest uppercase text-glow leading-tight">THE IMPOSTER</h2>
                      </>
                    ) : (
                      <>
                        <Shield size={48} className="text-[var(--color-brand-blue)] mb-4" />
                        <h2 className="text-5xl font-black text-[var(--color-brand-blue)] tracking-widest uppercase drop-shadow-[0_0_20px_rgba(59,130,246,0.6)] leading-tight">A CIVILIAN</h2>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center min-h-[90vh] py-8 z-10 relative">
      
      {/* Dynamic Background */}
      <AnimatePresence>
        {step === 1 && results.isImposterEliminated && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-red-950/20 pointer-events-none -z-10"
          >
            <div className="absolute w-[150vw] h-[150vh] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-transparent to-transparent mix-blend-screen" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col justify-center w-full">
        {step === 0 && (
          <motion.div 
            className="space-y-8 w-full"
            initial={animationsEnabled ? { opacity: 0, filter: "blur(10px)" } : {}}
            animate={animationsEnabled ? { opacity: 1, filter: "blur(0px)" } : {}}
          >
            <div className="text-center">
              <h2 className="text-4xl font-black text-[var(--color-text-main)] uppercase tracking-widest">The Votes</h2>
              <p className="text-[var(--color-text-muted)] mt-2">are in.</p>
            </div>
            {renderElimination()}
          </motion.div>
        )}

        {step === 1 && (
          <div className="space-y-12 w-full">
            {renderElimination()}
          </div>
        )}

        {step === 2 && (
          <motion.div 
            className="space-y-10 w-full text-center"
            initial={animationsEnabled ? { opacity: 0, y: 20 } : {}}
            animate={animationsEnabled ? { opacity: 1, y: 0 } : {}}
          >
            <div>
              <h2 className="text-5xl font-black text-[var(--color-brand-red)] uppercase tracking-widest text-glow leading-tight">IMPOSTERS WIN</h2>
              <p className="text-[var(--color-text-muted)] font-medium mt-2 tracking-wider">They escaped capture.</p>
            </div>
            
            <div className="glass-panel p-8 rounded-3xl w-full border border-[var(--color-brand-red)]/20 shadow-[0_0_40px_rgba(225,29,72,0.1)] relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-[var(--color-brand-red)] rounded-full blur-[60px] opacity-20 pointer-events-none" />
              <p className="text-[var(--color-text-muted)] mb-3 text-sm font-bold uppercase tracking-[0.2em]">The Secret Word was</p>
              <p className="text-4xl font-black text-[var(--color-text-main)] tracking-widest">{secretWord}</p>
            </div>
          </motion.div>
        )}
      </div>

      <div className="w-full pt-8 mt-auto">
        <button 
          onClick={handleNext} 
          className={`w-full py-5 font-black rounded-2xl text-xl transition-all shadow-lg active:scale-[0.98] tracking-widest ${
            step === 2 
              ? 'glass-panel hover:bg-[var(--color-surface-border)] text-[var(--color-text-main)] border border-[var(--color-surface-border)]'
              : 'bg-gradient-to-r from-[var(--color-brand-red)] to-[var(--color-brand-red-hover)] text-white box-glow'
          }`}
        >
          {step === 0 ? 'REVEAL ROLE' : step === 1 ? (results.isImposterEliminated ? 'IMPOSTER FINAL GUESS' : 'REVEAL SECRET WORD') : 'PLAY AGAIN'}
        </button>
      </div>
    </div>
  );
}
