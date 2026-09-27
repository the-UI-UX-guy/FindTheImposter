import { useGameStore } from '../store/gameStore';
import { useSettingsStore } from '../store/settingsStore';

export function ClueIntro() {
  const setPhase = useGameStore(state => state.setPhase);
  const { animationsEnabled } = useSettingsStore();

  return (
    <div className={`w-full max-w-md mx-auto flex flex-col items-center justify-center min-h-[80vh] space-y-8 text-center ${animationsEnabled ? 'animate-in fade-in duration-500' : ''}`}>
      <h2 className="text-4xl font-bold text-[var(--color-text-main)] leading-tight">
        Everyone knows their role.
      </h2>
      
      <p className="text-xl text-[var(--color-text-muted)]">
        It's time to give your clues.
      </p>

      <button 
        onClick={() => setPhase('CLUE_PHASE')}
        className="w-full mt-12 py-5 bg-[var(--color-brand-red)] hover:bg-[var(--color-brand-red-hover)] text-white font-bold rounded-2xl text-xl transition-all shadow-lg active:scale-95"
      >
        START CLUE ROUND
      </button>
    </div>
  );
}
