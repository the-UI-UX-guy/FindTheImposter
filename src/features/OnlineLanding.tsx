import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { useOnlineStore } from '../store/onlineStore';
import { Users, LogIn, Plus } from 'lucide-react';
import { audioManager } from '../utils/audioManager';

export function OnlineLanding() {
  const setPhase = useGameStore(state => state.setPhase);
  const [joinCode, setJoinCode] = useState('');

  const handleCreate = () => {
    audioManager.playSelect();
    setPhase('ONLINE_CREATE');
  };

  const handleJoin = () => {
    if (joinCode.trim().length === 0) return;
    audioManager.playSelect();
    // For now just route to JOIN with the code pre-filled or handled by that component
    // In a real flow, we might pass it via a prop or state, but let's just set the phase
    // and let ONLINE_JOIN handle it, maybe we store pendingJoinCode in onlineStore
    useOnlineStore.setState({ roomCode: joinCode.toUpperCase() });
    setPhase('ONLINE_JOIN');
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center min-h-[85vh] space-y-12 animate-in fade-in duration-300">
      
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-[var(--color-brand-blue)]/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
          <Users size={40} className="text-[var(--color-brand-blue)]" />
        </div>
        <h2 className="text-4xl font-black text-[var(--color-text-main)] tracking-wide">PLAY ONLINE</h2>
        <p className="text-[var(--color-text-muted)] text-sm px-8">Host a game or join your friends remotely.</p>
      </div>

      <div className="w-full space-y-8 px-4">
        
        {/* Create Room */}
        <div className="glass-panel p-6 rounded-3xl border border-[var(--color-surface-border)] shadow-xl relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-[var(--color-brand-blue)] rounded-full blur-[60px] opacity-10" />
          <h3 className="text-xl font-bold text-[var(--color-text-main)] mb-2">CREATE A ROOM</h3>
          <p className="text-[var(--color-text-muted)] text-sm mb-6">Host a new game and invite your friends.</p>
          
          <button 
            onClick={handleCreate}
            className="w-full py-4 bg-[var(--color-brand-blue)] hover:bg-[var(--color-brand-blue-hover)] text-white font-bold rounded-2xl transition-all flex items-center justify-center space-x-2 active:scale-95 shadow-lg"
          >
            <Plus size={20} />
            <span>CREATE ROOM</span>
          </button>
        </div>

        <div className="flex items-center justify-center space-x-4 opacity-50">
          <div className="flex-1 h-px bg-[var(--color-surface-border)]"></div>
          <span className="text-xs font-bold tracking-widest text-[var(--color-text-muted)]">OR</span>
          <div className="flex-1 h-px bg-[var(--color-surface-border)]"></div>
        </div>

        {/* Join Room */}
        <div className="glass-panel p-6 rounded-3xl border border-[var(--color-surface-border)] shadow-xl relative overflow-hidden">
          <h3 className="text-xl font-bold text-[var(--color-text-main)] mb-2">JOIN A ROOM</h3>
          <p className="text-[var(--color-text-muted)] text-sm mb-6">Enter the code shared by your host.</p>
          
          <div className="flex space-x-3">
            <input 
              type="text" 
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="e.g. A7K9Q2"
              maxLength={6}
              className="flex-1 bg-[var(--color-surface-bg)] border border-[var(--color-surface-border)] rounded-2xl px-4 py-4 text-center text-xl font-bold tracking-widest text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-brand-blue)] focus:ring-1 focus:ring-[var(--color-brand-blue)] transition-all uppercase placeholder:normal-case placeholder:tracking-normal"
            />
            <button 
              onClick={handleJoin}
              disabled={joinCode.length < 3}
              className="px-6 bg-[var(--color-surface-card)] border border-[var(--color-surface-border)] text-[var(--color-text-main)] hover:bg-[var(--color-surface-border)] font-bold rounded-2xl transition-all flex items-center justify-center active:scale-95 disabled:opacity-50 disabled:active:scale-100"
            >
              <LogIn size={20} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
