import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { audioManager } from '../utils/audioManager';
import { useSettingsStore } from '../store/settingsStore';
import { useOnlineStore } from '../store/onlineStore';

export function Discussion() {
  const { animationsEnabled } = useSettingsStore();
  const { isOnline, isHost, socket, roomCode } = useOnlineStore();

  useEffect(() => {
    if (isOnline && socket) {
      const handleStartVoting = () => {
        audioManager.playVoteReveal();
        useGameStore.setState({ currentPlayerIndex: 0, phase: 'VOTING' });
      };
      socket.on('start-voting', handleStartVoting);
      return () => {
        socket.off('start-voting', handleStartVoting);
      };
    }
  }, [isOnline, socket]);

  const startVoting = () => {
    if (isOnline && socket) {
      socket.emit('start-voting', { roomCode });
    } else {
      audioManager.playVoteReveal();
      useGameStore.setState({ currentPlayerIndex: 0, phase: 'VOTING' });
    }
  };

  return (
    <div className={`w-full max-w-md mx-auto flex flex-col items-center justify-center min-h-[80vh] space-y-8 text-center ${animationsEnabled ? 'animate-in zoom-in duration-500' : ''}`}>
      <h2 className="text-5xl font-black text-[var(--color-brand-red)] tracking-wider drop-shadow-lg">
        TIME TO DISCUSS
      </h2>
      
      <p className="text-xl text-[var(--color-text-muted)] px-6">
        {isOnline && !isHost ? "Discuss who the imposter is. Waiting for host to start voting..." : "Who gave the most suspicious clue? Who was too vague? Discuss it!"}
      </p>

      {(!isOnline || isHost) && (
        <button 
          onClick={startVoting}
          className="w-full mt-12 py-5 bg-[var(--color-brand-red)] hover:bg-[var(--color-brand-red-hover)] text-white font-bold rounded-2xl text-xl transition-all shadow-lg active:scale-95 border border-[var(--color-brand-red)]"
        >
          START VOTING
        </button>
      )}
    </div>
  );
}
