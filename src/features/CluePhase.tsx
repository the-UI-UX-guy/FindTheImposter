import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { useSettingsStore } from '../store/settingsStore';
import { Play, Pause } from 'lucide-react';
import { audioManager } from '../utils/audioManager';
import { motion } from 'framer-motion';

export function CluePhase() {
  const { settings, setPhase } = useGameStore();
  const { animationsEnabled } = useSettingsStore();
  
  const [timeLeft, setTimeLeft] = useState(settings.timerSeconds);
  const [isTimerRunning, setIsTimerRunning] = useState(settings.timerSeconds > 0);

  useEffect(() => {
    if (!isTimerRunning || timeLeft <= 0) {
      if (timeLeft === 0 && isTimerRunning) {
        audioManager.playTimeUp();
        setIsTimerRunning(false);
      }
      return;
    }
    
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        const next = prev - 1;
        if (next > 0) {
          if (next <= 3) {
            audioManager.playDramaticTick();
          } else if (next <= 10) {
            audioManager.playFastTick();
          } else {
            audioManager.playTick();
          }
        }
        return next;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const handleFinish = () => {
    setPhase('DISCUSSION');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getCluePrompt = () => {
    switch(settings.mode) {
      case 'ONE_WORD': return 'Give exactly ONE word.';
      case 'TWO_WORDS': return 'Give exactly TWO words.';
      case 'DESCRIPTION': return 'Describe the word in a short sentence.';
      case 'CLASSIC':
      default: return 'Give your clues.';
    }
  }

  return (
    <div className={`w-full max-w-md mx-auto flex flex-col items-center justify-between min-h-[90vh] py-10 space-y-8 ${animationsEnabled ? 'animate-in fade-in duration-300' : ''}`}>
      
      <div className="text-center space-y-2">
        <h2 className="text-sm font-bold text-[var(--color-brand-red)] uppercase tracking-[0.2em] mb-4">Phase 2</h2>
        <h3 className="text-4xl font-black text-[var(--color-text-main)] uppercase tracking-widest text-glow">Clues</h3>
        <p className="text-[var(--color-text-muted)] text-sm mt-2">Everyone give your clues.</p>
      </div>

      <div className="glass-panel p-8 rounded-3xl w-full text-center relative overflow-hidden group border border-[var(--color-brand-blue)]/20 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[var(--color-brand-blue)] rounded-full blur-[80px] opacity-20 pointer-events-none" />
        <p className="text-xl text-[var(--color-text-main)] font-medium relative z-10">
          {getCluePrompt()}
        </p>
      </div>
      
      {/* Timer Section */}
      <div className="flex-1 flex flex-col justify-center items-center w-full">
        {settings.timerSeconds > 0 ? (
          <div className="flex flex-col items-center space-y-12">
            {timeLeft === 0 ? (
              <motion.div 
                className="text-6xl font-black text-[var(--color-brand-red)] text-glow"
                animate={animationsEnabled ? { scale: [1, 1.1, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                TIME'S UP
              </motion.div>
            ) : (
              <motion.div 
                className={`text-8xl font-black tabular-nums tracking-tighter ${timeLeft <= 10 ? 'text-[var(--color-brand-red)] text-glow' : 'text-[var(--color-text-main)] drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]'}`}
                animate={timeLeft <= 10 && animationsEnabled ? { opacity: [1, 0.5, 1] } : {}}
                transition={{ duration: timeLeft <= 3 ? 0.3 : 1, repeat: Infinity }}
              >
                {formatTime(timeLeft)}
              </motion.div>
            )}
            
            <button 
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="w-20 h-20 glass-panel hover:bg-[var(--color-surface-border)] rounded-full flex items-center justify-center transition-all text-[var(--color-text-main)] border border-[var(--color-surface-border)] hover:border-white/20 active:scale-95 z-10"
            >
              {isTimerRunning ? <Pause size={32} /> : <Play size={32} fill="currentColor" className="ml-1" />}
            </button>
          </div>
        ) : (
          <div className="text-[var(--color-text-muted)] italic opacity-50">No timer set</div>
        )}
      </div>

      <button 
        onClick={handleFinish}
        className="w-full py-5 bg-[var(--color-surface-card)] hover:bg-[var(--color-surface-border)] text-[var(--color-text-main)] font-black rounded-2xl text-xl transition-all shadow-lg active:scale-[0.98] border border-[var(--color-surface-border)] tracking-widest mt-auto z-10"
      >
        FINISH CLUES
      </button>
    </div>
  );
}
