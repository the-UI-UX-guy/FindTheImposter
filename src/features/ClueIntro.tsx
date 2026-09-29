import { useGameStore } from '../store/gameStore';
import { useSettingsStore } from '../store/settingsStore';
import { useOnlineStore } from '../store/onlineStore';
import { audioManager } from '../utils/audioManager';
import { useEffect } from 'react';

export function ClueIntro() {
  const setPhase = useGameStore(state => state.setPhase);
  const { animationsEnabled } = useSettingsStore();
  const { isOnline, isHost, socket } = useOnlineStore();

  useEffect(() => {
    if (isOnline && socket) {
      const handleStartClue = () => {
        setPhase('CLUE_PHASE');
      };
      socket.on('start-clue-phase', handleStartClue);
      return () => {
        socket.off('start-clue-phase', handleStartClue);
      };
    }
  }, [isOnline, socket, setPhase]);

  const handleStart = () => {
    audioManager.playSelect();
    if (isOnline) {
      if (isHost && socket) {
        socket.emit('start-clue-phase', { roomCode: useOnlineStore.getState().roomCode });
      }
    } else {
      setPhase('CLUE_PHASE');
    }
  };

  return (
    <div className={`w-full max-w-md mx-auto flex flex-col items-center justify-center min-h-[80vh] space-y-8 text-center ${animationsEnabled ? 'animate-in fade-in duration-500' : ''}`}>
      <h2 className="text-4xl font-bold text-[var(--color-text-main)] leading-tight">
        Everyone knows their role.
      </h2>
      
      <p className="text-xl text-[var(--color-text-muted)]">
        {isOnline && !isHost ? "Waiting for the host to start..." : "It's time to give your clues."}
      </p>

      {(!isOnline || isHost) && (
        <button 
          onClick={handleStart}
          className="w-full mt-12 py-5 bg-[var(--color-brand-red)] hover:bg-[var(--color-brand-red-hover)] text-white font-bold rounded-2xl text-xl transition-all shadow-lg active:scale-95"
        >
          START CLUE ROUND
        </button>
      )}
    </div>
  );
}
