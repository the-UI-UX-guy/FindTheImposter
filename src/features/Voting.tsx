import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { useSettingsStore } from '../store/settingsStore';
import { audioManager } from '../utils/audioManager';
import { motion, AnimatePresence } from 'framer-motion';

export function Voting() {
  const { players, currentPlayerIndex, setPhase } = useGameStore();
  const { animationsEnabled } = useSettingsStore();
  const [showVoting, setShowVoting] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  
  const currentPlayer = players[currentPlayerIndex];

  const handleVote = () => {
    if (!selectedPlayer) return;
    audioManager.playVote();
    useGameStore.setState(state => ({
      votes: { ...state.votes, [currentPlayer.id]: selectedPlayer }
    }));
    
    setShowVoting(false);
    setSelectedPlayer(null);
    
    if (currentPlayerIndex < players.length - 1) {
      useGameStore.setState({ currentPlayerIndex: currentPlayerIndex + 1 });
    } else {
      setPhase('RESULTS');
    }
  };

  if (!currentPlayer) return null;

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center min-h-[90vh] py-8 space-y-8 z-10 relative">
      <AnimatePresence mode="wait">
        {!showVoting ? (
          <motion.div 
            key="handover"
            className="text-center space-y-8 w-full flex-1 flex flex-col justify-center"
            initial={animationsEnabled ? { opacity: 0, scale: 0.95 } : {}}
            animate={animationsEnabled ? { opacity: 1, scale: 1 } : {}}
            exit={animationsEnabled ? { opacity: 0, scale: 1.05 } : {}}
            transition={{ duration: 0.4 }}
          >
            <div className="space-y-2">
              <p className="text-xl text-[var(--color-text-muted)] font-medium tracking-widest uppercase">Pass the phone to</p>
              <h2 className="text-5xl font-black text-[var(--color-text-main)] truncate px-4">{currentPlayer.name}</h2>
            </div>
            
            <button 
              onClick={() => { audioManager.playSelect(); setShowVoting(true); }}
              className="w-full mt-12 py-6 glass-panel hover:bg-[var(--color-surface-border)] text-[var(--color-text-main)] font-black rounded-2xl text-xl transition-all shadow-xl active:scale-[0.98] border border-[var(--color-surface-border)] hover:border-white/20 tracking-wider"
            >
              I'M {currentPlayer.name.toUpperCase()}
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="voting"
            className="w-full flex-1 flex flex-col justify-between"
            initial={animationsEnabled ? { opacity: 0, y: 20 } : {}}
            animate={animationsEnabled ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4 }}
          >
            <div className="space-y-8 flex-1 flex flex-col justify-center">
              <div className="text-center">
                <h3 className="text-sm font-bold text-[var(--color-brand-red)] uppercase tracking-[0.2em] mb-2">Phase 3</h3>
                <h2 className="text-3xl font-black text-[var(--color-text-main)] uppercase tracking-widest text-glow">Who is the Imposter?</h2>
                <p className="text-[var(--color-text-muted)] mt-2 text-sm">Discuss. Trust nobody.</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pb-4 px-1">
                {players.filter(p => p.id !== currentPlayer.id).map(p => (
                  <button 
                    key={p.id}
                    onClick={() => { audioManager.playSelect(); setSelectedPlayer(p.id); }}
                    className={`py-4 px-2 font-bold rounded-2xl transition-all border ${
                      selectedPlayer === p.id 
                        ? 'bg-[var(--color-brand-red)]/20 border-[var(--color-brand-red)] text-[var(--color-brand-red)] shadow-[0_0_15px_rgba(225,29,72,0.3)] scale-105' 
                        : 'glass-panel hover:bg-[var(--color-surface-border)] text-[var(--color-text-main)] border-[var(--color-surface-border)]'
                    }`}
                  >
                    <span className="truncate block w-full">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 mt-auto">
              <button 
                disabled={!selectedPlayer}
                onClick={handleVote}
                className="w-full py-5 bg-gradient-to-r from-[var(--color-brand-red)] to-[var(--color-brand-red-hover)] text-white font-black rounded-2xl text-xl transition-all shadow-lg hover:shadow-red-900/50 active:scale-[0.98] box-glow disabled:opacity-30 disabled:scale-100 disabled:shadow-none disabled:cursor-not-allowed"
              >
                CONFIRM VOTE
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
