import { useGameStore } from '../store/gameStore';
import { useSettingsStore } from '../store/settingsStore';

export function Settings() {
  const setPhase = useGameStore(state => state.setPhase);
  const { 
    soundEnabled, setSoundEnabled, 
    animationsEnabled, setAnimationsEnabled,
    darkModeEnabled, setDarkModeEnabled 
  } = useSettingsStore();

  return (
    <div className="w-full max-w-md mx-auto flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-[var(--color-text-main)]">Settings</h2>
        <button onClick={() => setPhase('HOME')} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]">
          Back
        </button>
      </div>

      <div className="bg-[var(--color-surface-card)] p-6 rounded-3xl border border-[var(--color-surface-border)] space-y-8">
        
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-[var(--color-text-main)] font-semibold text-lg">Sound Effects</h3>
            <p className="text-sm text-[var(--color-text-muted)]">Play sounds during the game</p>
          </div>
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`w-14 h-8 rounded-full relative transition-colors ${soundEnabled ? 'bg-[var(--color-brand-red)]' : 'bg-slate-500'}`}
          >
            <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full transition-transform ${soundEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-[var(--color-text-main)] font-semibold text-lg">Animations</h3>
            <p className="text-sm text-[var(--color-text-muted)]">Enable UI animations</p>
          </div>
          <button 
            onClick={() => setAnimationsEnabled(!animationsEnabled)}
            className={`w-14 h-8 rounded-full relative transition-colors ${animationsEnabled ? 'bg-[var(--color-brand-red)]' : 'bg-slate-500'}`}
          >
            <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full transition-transform ${animationsEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-[var(--color-text-main)] font-semibold text-lg">Dark Mode</h3>
            <p className="text-sm text-[var(--color-text-muted)]">Game theme</p>
          </div>
          <button 
            onClick={() => setDarkModeEnabled(!darkModeEnabled)}
            className={`w-14 h-8 rounded-full relative transition-colors ${darkModeEnabled ? 'bg-[var(--color-brand-red)]' : 'bg-slate-500'}`}
          >
            <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full transition-transform ${darkModeEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>

      </div>
      
      <p className="text-center text-[var(--color-text-muted)] text-sm mt-8">
        Settings are automatically saved.
      </p>
    </div>
  );
}
