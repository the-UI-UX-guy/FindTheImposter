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
import { AnimatePresence } from 'framer-motion'

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
      <AnimatePresence>
        {showSplash && <Splash onComplete={() => setShowSplash(false)} />}
      </AnimatePresence>

      <div className={`flex flex-col items-center min-h-screen bg-[var(--color-surface-bg)] text-[var(--color-text-main)] p-4 transition-colors duration-300 ${showSplash ? 'opacity-0' : 'opacity-100 transition-opacity duration-1000'}`}>
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
