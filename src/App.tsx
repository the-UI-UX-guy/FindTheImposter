import { useEffect, useState } from 'react'
import { useGameStore } from './store/gameStore'
import { useSettingsStore } from './store/settingsStore'
import { Splash } from './features/Splash'
import { Home } from './features/Home'
import { Setup } from './features/Setup'
import { PlayerReveal } from './features/PlayerReveal'
import { ClueIntro } from './features/ClueIntro'
import { CluePhase } from './features/CluePhase'
import { Discussion } from './features/Discussion'
import { Voting } from './features/Voting'
import { Results } from './features/Results'
import { FinalGuess } from './features/FinalGuess'
import { HowToPlay } from './features/HowToPlay'
import { Settings } from './features/Settings'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Settings as SettingsIcon } from 'lucide-react'
import { audioManager } from './utils/audioManager'

function TopNav() {
  const { phase, previousPhase, setPhase, resetGame } = useGameStore();
  
  if (phase === 'HOME') return null;

  const handleBack = () => {
    audioManager.playSelect();
    
    // Non-game phases where we can just go back safely
    if (['SETUP', 'HOW_TO_PLAY', 'SETTINGS'].includes(phase)) {
      if (phase === 'SETTINGS' && previousPhase && previousPhase !== 'HOME') {
        // If we came from a game phase to settings, go back to it
        setPhase(previousPhase);
      } else {
        setPhase('HOME');
      }
    } else {
      // We are in a game phase
      if (window.confirm("Are you sure you want to leave the current game?")) {
        resetGame();
      }
    }
  };

  const handleSettings = () => {
    audioManager.playSelect();
    setPhase('SETTINGS');
  };

  return (
    <div className="fixed top-0 left-0 right-0 p-4 flex justify-between items-center z-[100] pointer-events-none">
      <motion.button 
        whileTap={{ scale: 0.9 }}
        onClick={handleBack}
        className="pointer-events-auto w-10 h-10 rounded-full bg-[var(--color-surface-bg)]/80 backdrop-blur-md border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-text-main)] hover:bg-[var(--color-surface-border)] hover:text-white transition-all shadow-lg"
      >
        <ArrowLeft size={20} />
      </motion.button>
      
      {phase !== 'SETTINGS' && (
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={handleSettings}
          className="pointer-events-auto w-10 h-10 rounded-full bg-[var(--color-surface-bg)]/80 backdrop-blur-md border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-text-main)] hover:bg-[var(--color-surface-border)] hover:text-white transition-all shadow-lg"
        >
          <SettingsIcon size={20} />
        </motion.button>
      )}
    </div>
  );
}

function App() {
  const phase = useGameStore((state) => state.phase)
  const darkModeEnabled = useSettingsStore(state => state.darkModeEnabled)
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    if (darkModeEnabled) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkModeEnabled]);

  return (
    <div className="relative">
      <TopNav />
      <AnimatePresence>
        {showSplash && <Splash onComplete={() => setShowSplash(false)} />}
      </AnimatePresence>

      <div className={`flex flex-col items-center min-h-screen bg-[var(--color-surface-bg)] text-[var(--color-text-main)] p-4 ${phase !== 'HOME' ? 'pt-20' : ''} transition-colors duration-300 ${showSplash ? 'opacity-0' : 'opacity-100 transition-opacity duration-1000'}`}>
        {phase === 'HOME' && <Home />}
        {phase === 'SETUP' && <Setup />}
        {phase === 'HOW_TO_PLAY' && <HowToPlay />}
        {phase === 'SETTINGS' && <Settings />}
        {phase === 'PLAYER_REVEAL' && <PlayerReveal />}
        {phase === 'CLUE_INTRO' && <ClueIntro />}
        {phase === 'CLUE_PHASE' && <CluePhase />}
        {phase === 'DISCUSSION' && <Discussion />}
        {phase === 'VOTING' && <Voting />}
        {phase === 'RESULTS' && <Results />}
        {phase === 'FINAL_GUESS' && <FinalGuess />}
      </div>
    </div>
  )
}

export default App
