import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { useSettingsStore } from '../store/settingsStore';
import { useOnlineStore } from '../store/onlineStore';
import { audioManager } from '../utils/audioManager';

export function FinalGuess() {
  const { secretWord } = useGameStore();
  const { animationsEnabled } = useSettingsStore();
  const { isOnline, socket, roomCode, privateRole, isHost } = useOnlineStore();
  
  const [guess, setGuess] = useState('');
  const [result, setResult] = useState<'PENDING' | 'WIN' | 'LOSE'>('PENDING');

  const isLocalImposter = isOnline ? privateRole === 'IMPOSTER' : true; // In pass&play, they pass the device to the imposter

  useEffect(() => {
    if (isOnline && socket) {
      const handleGuessResult = (data: { success: boolean, guess: string }) => {
        if (data.success) {
          audioManager.playTimeUp(); // Imposter win
          setResult('WIN');
        } else {
          audioManager.playSuccess(); // Civilians win
          setResult('LOSE');
        }
      };
      
      const handleReturnToLobby = () => {
        useGameStore.getState().resetGame();
        useGameStore.getState().setPhase('ONLINE_LOBBY');
      };

      socket.on('final-guess-result', handleGuessResult);
      socket.on('return-to-lobby', handleReturnToLobby);
      
      return () => {
        socket.off('final-guess-result', handleGuessResult);
        socket.off('return-to-lobby', handleReturnToLobby);
      };
    }
  }, [isOnline, socket]);

  const checkGuess = () => {
    if (!guess.trim()) return;
    
    // Simple normalization for guessing
    const normalizedSecret = secretWord.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const normalizedGuess = guess.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const success = normalizedSecret === normalizedGuess;
    
    if (isOnline && socket) {
      socket.emit('submit-final-guess', { roomCode, guess: guess.trim(), success });
    } else {
      if (success) {
        audioManager.playTimeUp(); // Imposter win
        setResult('WIN');
      } else {
        audioManager.playSuccess(); // Civilians win
        setResult('LOSE');
      }
    }
  };

  const handlePlayAgain = () => {
    if (isOnline && isHost && socket) {
      socket.emit('return-to-lobby', { roomCode });
    } else {
      useGameStore.getState().resetGame();
    }
  };

  if (result !== 'PENDING') {
    return (
      <div className={`w-full max-w-md mx-auto flex flex-col items-center justify-center min-h-[80vh] space-y-8 text-center ${animationsEnabled ? 'animate-in zoom-in duration-500' : ''}`}>
        <h2 className={`text-6xl font-black tracking-wider ${result === 'WIN' ? 'text-[var(--color-brand-red)]' : 'text-[var(--color-brand-blue)]'}`}>
          {result === 'WIN' ? 'IMPOSTERS WIN!' : 'CIVILIANS WIN!'}
        </h2>
        
        <p className="text-xl text-[var(--color-text-muted)]">
          {result === 'WIN' ? 'They guessed the word correctly!' : 'The Imposter guessed incorrectly.'}
        </p>

        <div className="bg-[var(--color-surface-card)] p-8 rounded-3xl w-full border border-[var(--color-surface-border)] shadow-xl my-8">
          <p className="text-[var(--color-text-muted)] mb-2">The Secret Word was</p>
          <p className="text-4xl font-bold text-[var(--color-text-main)] tracking-wider">{secretWord}</p>
        </div>

        {(!isOnline || isHost) && (
          <button 
            onClick={handlePlayAgain}
            className="w-full py-5 bg-[var(--color-surface-card)] hover:bg-[var(--color-surface-border)] text-[var(--color-text-main)] font-bold rounded-2xl text-xl transition-all shadow-lg active:scale-95 border border-[var(--color-surface-border)]"
          >
            PLAY AGAIN
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`w-full max-w-md mx-auto flex flex-col items-center justify-center min-h-[80vh] space-y-8 text-center ${animationsEnabled ? 'animate-in fade-in' : ''}`}>
      <div className="space-y-4">
        <h2 className="text-4xl font-bold text-[var(--color-brand-red)]">
          {isLocalImposter ? "YOU'VE BEEN CAUGHT!" : "IMPOSTER CAUGHT!"}
        </h2>
        <p className="text-xl text-[var(--color-text-muted)]">
          {isLocalImposter ? "But you have one last chance..." : "Waiting for their final guess..."}
        </p>
      </div>

      <div className="bg-[var(--color-surface-card)] p-6 rounded-3xl w-full border border-[var(--color-surface-border)] shadow-xl space-y-6">
        <p className="text-lg text-[var(--color-text-main)] font-medium">What was the secret word?</p>
        
        {isLocalImposter ? (
          <>
            <input 
              type="text" 
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Enter your guess..."
              className="w-full bg-[var(--color-surface-bg)] text-[var(--color-text-main)] px-4 py-4 rounded-xl text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-red)]"
            />
            <button 
              onClick={checkGuess}
              className="w-full py-4 bg-[var(--color-brand-red)] hover:bg-[var(--color-brand-red-hover)] text-white font-bold rounded-xl text-xl transition-all shadow-lg active:scale-95"
            >
              SUBMIT GUESS
            </button>
          </>
        ) : (
          <div className="w-full bg-[var(--color-surface-bg)] text-[var(--color-text-muted)] px-4 py-4 rounded-xl text-center text-xl font-bold border border-dashed border-[var(--color-surface-border)]">
            Waiting...
          </div>
        )}
      </div>
    </div>
  );
}
