import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { useOnlineStore } from '../store/onlineStore';
import { useSettingsStore } from '../store/settingsStore';
import { motion, AnimatePresence } from 'framer-motion';
import { audioManager } from '../utils/audioManager';
import { 
  Users, Crown, LogOut, Copy, Share2, Play, Settings as SettingsIcon, 
  UserMinus, AlertCircle 
} from 'lucide-react';

const CATEGORY_EMOJIS: Record<string, string> = {
  'Animals': '🦁',
  'Food': '🍕',
  'Places': '🏙️',
  'Movies': '🎬',
  'Objects': '📦',
  'Nature': '🌲',
  'Sports': '⚽',
  'Technology': '💻',
  'Everyday Life': '☕',
  'People': '👥'
};

export function OnlineLobby() {
  const { setPhase, updateSettings: updateLocalSettings } = useGameStore();
  const { 
    socket, roomCode, onlinePlayers, roomSettings, isHost, myPlayerId, 
    disconnect, updatePlayers 
  } = useOnlineStore();
  const { animationsEnabled } = useSettingsStore();
  
  const [toast, setToast] = useState<string | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showKickModal, setShowKickModal] = useState<string | null>(null); // player ID to kick

  const showToast = (message: string) => {
    setToast(message);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (!socket) {
      setPhase('HOME');
      return;
    }

    const handlePlayerJoined = (data: any) => {
      audioManager.playSelect();
      updatePlayers(data.room.players);
      showToast(`✨ ${data.player.name} joined`);
    };

    const handlePlayerLeft = (data: any) => {
      updatePlayers(data.room.players);
      // Find who left if possible, or just update the list
    };

    const handleKicked = () => {
      disconnect();
      setPhase('HOME');
      setTimeout(() => alert("You were removed from the room by the host."), 100);
    };

    const handleSettingsUpdated = (data: any) => {
      useOnlineStore.setState({ roomSettings: data.settings });
      updateLocalSettings(data.settings);
    };

    const handleGameStarted = () => {
      // Transition to game role reveal
      setPhase('PLAYER_REVEAL');
    };

    const handlePrivateRoleReveal = (data: any) => {
      useOnlineStore.getState().setGameData(data.role, data.secretWord || null, data.hintWord || null, data.category || 'RANDOM');
    };

    socket.on('player-joined', handlePlayerJoined);
    socket.on('player-left', handlePlayerLeft);
    socket.on('kicked', handleKicked);
    socket.on('settings-updated', handleSettingsUpdated);
    socket.on('game-started', handleGameStarted);
    socket.on('private-role-reveal', handlePrivateRoleReveal);

    return () => {
      socket.off('player-joined', handlePlayerJoined);
      socket.off('player-left', handlePlayerLeft);
      socket.off('kicked', handleKicked);
      socket.off('settings-updated', handleSettingsUpdated);
      socket.off('game-started', handleGameStarted);
      socket.off('private-role-reveal', handlePrivateRoleReveal);
    };
  }, [socket, setPhase, updatePlayers, updateLocalSettings, disconnect]);

  const handleCopyCode = () => {
    audioManager.playSelect();
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      showToast("Room code copied!");
    }
  };

  const handleShareLink = () => {
    audioManager.playSelect();
    const url = `${window.location.origin}/#/join/${roomCode}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Join my Imposter Game',
        text: `Play IMPOSTER with me! Room Code: ${roomCode}`,
        url: url,
      }).catch(err => {
        console.error("Share failed", err);
        navigator.clipboard.writeText(url);
        showToast("Invite link copied!");
      });
    } else {
      navigator.clipboard.writeText(url);
      showToast("Invite link copied!");
    }
  };

  const handleLeaveRoom = () => {
    audioManager.playSelect();
    if (window.confirm("Are you sure you want to leave this room?")) {
      socket?.emit('leave-room', { roomCode });
      disconnect();
      setPhase('HOME');
    }
  };

  const confirmKick = () => {
    if (showKickModal && socket) {
      socket.emit('kick-player', { roomCode, targetId: showKickModal });
      setShowKickModal(null);
    }
  };

  const handleStartGame = () => {
    if (!isHost) return;
    
    if (onlinePlayers.length < 3) {
      showToast("Need at least 3 players to start.");
      return;
    }
    
    if (roomSettings.imposterCount >= onlinePlayers.length) {
      showToast("Too many imposters for this player count.");
      return;
    }
    
    audioManager.playSelect();
    socket?.emit('start-game', { roomCode });
  };

  if (!roomCode || !roomSettings) return null;

  return (
    <div className="w-full max-w-md mx-auto flex flex-col min-h-[90vh] relative pb-28 pt-8">
      
      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 bg-[var(--color-brand-blue)] text-white px-5 py-3 rounded-full shadow-[0_5px_30px_rgba(59,130,246,0.4)] z-[110] flex items-center space-x-2 whitespace-nowrap border border-white/20"
          >
            <AlertCircle size={18} />
            <span className="font-bold text-sm tracking-wide">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header / Room Code */}
      <div className="flex flex-col items-center justify-center text-center mb-8 px-4 space-y-4">
        <h2 className="text-sm font-bold text-[var(--color-text-muted)] uppercase tracking-[0.3em]">Room Code</h2>
        <div className="text-5xl font-black text-[var(--color-text-main)] tracking-[0.2em]">{roomCode}</div>
        
        <div className="flex items-center justify-center space-x-3 mt-4">
          <button 
            onClick={handleCopyCode}
            className="bg-[var(--color-surface-card)] hover:bg-[var(--color-surface-border)] border border-[var(--color-surface-border)] px-4 py-2 rounded-xl text-sm font-bold text-[var(--color-text-main)] flex items-center space-x-2 transition-colors active:scale-95"
          >
            <Copy size={16} />
            <span>COPY</span>
          </button>
          <button 
            onClick={handleShareLink}
            className="bg-[var(--color-surface-card)] hover:bg-[var(--color-surface-border)] border border-[var(--color-surface-border)] px-4 py-2 rounded-xl text-sm font-bold text-[var(--color-text-main)] flex items-center space-x-2 transition-colors active:scale-95"
          >
            <Share2 size={16} />
            <span>SHARE</span>
          </button>
        </div>
      </div>

      <div className="space-y-6 px-4">
        
        {/* PLAYERS LIST */}
        <div className="glass-panel rounded-3xl p-6 border border-[var(--color-surface-border)] shadow-xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-6 border-b border-[var(--color-surface-border)] pb-4">
            <h3 className="text-sm font-bold text-[var(--color-text-muted)] uppercase tracking-widest flex items-center">
              <Users size={16} className="mr-2" />
              Players
            </h3>
            <span className="text-xs font-bold bg-[var(--color-surface-bg)] px-3 py-1 rounded-full text-[var(--color-text-main)] border border-[var(--color-surface-border)]">
              {onlinePlayers.length} / 20
            </span>
          </div>

          <div className="space-y-3 max-h-[35vh] overflow-y-auto custom-scrollbar pr-2">
            <AnimatePresence>
              {onlinePlayers.map((player: any) => (
                <motion.div 
                  key={player.id}
                  initial={animationsEnabled ? { opacity: 0, x: -20 } : {}}
                  animate={animationsEnabled ? { opacity: 1, x: 0 } : {}}
                  exit={animationsEnabled ? { opacity: 0, scale: 0.9 } : {}}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-colors ${player.id === myPlayerId ? 'bg-[var(--color-brand-blue)]/10 border-[var(--color-brand-blue)]/30' : 'bg-[var(--color-surface-bg)] border-[var(--color-surface-border)]'}`}
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    {player.isHost && (
                      <Crown size={18} className="text-yellow-500 shrink-0" />
                    )}
                    <span className="font-bold text-[var(--color-text-main)] truncate">
                      {player.name} {player.id === myPlayerId && "(You)"}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {/* Status dot */}
                    <div className="flex items-center space-x-1.5 px-2">
                      <div className={`w-2 h-2 rounded-full ${player.isOnline ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`}></div>
                    </div>
                    
                    {isHost && player.id !== myPlayerId && (
                      <button 
                        onClick={() => setShowKickModal(player.id)}
                        className="w-8 h-8 rounded-full hover:bg-[var(--color-brand-red)]/20 text-[var(--color-text-muted)] hover:text-[var(--color-brand-red)] flex items-center justify-center transition-colors"
                      >
                        <UserMinus size={16} />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* GAME SETTINGS READONLY */}
        <div className="glass-panel rounded-3xl p-6 border border-[var(--color-surface-border)] shadow-xl relative overflow-hidden">
          <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-[var(--color-brand-blue)] rounded-full blur-[60px] opacity-10" />
          
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-[var(--color-text-muted)] uppercase tracking-widest flex items-center">
              <SettingsIcon size={16} className="mr-2" />
              Settings
            </h3>
            {isHost && (
              <span className="text-xs text-[var(--color-brand-blue)] bg-[var(--color-brand-blue)]/10 px-2 py-1 rounded-md font-bold">
                You control settings
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-[var(--color-surface-bg)] rounded-xl p-3 border border-[var(--color-surface-border)]">
              <span className="text-[var(--color-text-muted)] block text-xs mb-1 uppercase tracking-wider">Mode</span>
              <span className="font-bold text-white truncate block">{roomSettings.mode}</span>
            </div>
            <div className="bg-[var(--color-surface-bg)] rounded-xl p-3 border border-[var(--color-surface-border)]">
              <span className="text-[var(--color-text-muted)] block text-xs mb-1 uppercase tracking-wider">Category</span>
              <span className="font-bold text-white truncate block">
                {roomSettings.category === 'RANDOM' ? '🎲 Random' : `${CATEGORY_EMOJIS[roomSettings.category] || '▪️'} ${roomSettings.category}`}
              </span>
            </div>
            <div className="bg-[var(--color-surface-bg)] rounded-xl p-3 border border-[var(--color-surface-border)]">
              <span className="text-[var(--color-text-muted)] block text-xs mb-1 uppercase tracking-wider">Imposters</span>
              <span className="font-bold text-white truncate block">{roomSettings.imposterCount}</span>
            </div>
            <div className="bg-[var(--color-surface-bg)] rounded-xl p-3 border border-[var(--color-surface-border)]">
              <span className="text-[var(--color-text-muted)] block text-xs mb-1 uppercase tracking-wider">Timer</span>
              <span className="font-bold text-white truncate block">
                {roomSettings.timerSeconds ? `${roomSettings.timerSeconds / 60} Min` : 'None'}
              </span>
            </div>
          </div>
        </div>

      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[var(--color-surface-bg)] via-[var(--color-surface-bg)] to-transparent pointer-events-none z-50">
        <div className="max-w-md mx-auto pointer-events-auto space-y-3">
          {isHost ? (
            <button 
              onClick={handleStartGame}
              className="w-full py-5 bg-[var(--color-brand-blue)] hover:bg-[var(--color-brand-blue-hover)] text-white font-black rounded-2xl text-xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] active:scale-[0.98] flex items-center justify-center space-x-2"
            >
              <Play size={24} className="fill-current" />
              <span>START GAME</span>
            </button>
          ) : (
            <div className="w-full py-5 bg-[var(--color-surface-card)] border border-[var(--color-brand-blue)]/30 text-[var(--color-brand-blue)] font-black rounded-2xl text-xl flex items-center justify-center space-x-3 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
              <div className="w-4 h-4 rounded-full border-2 border-[var(--color-brand-blue)] border-t-transparent animate-spin" />
              <span>WAITING FOR HOST...</span>
            </div>
          )}
          
          <button 
            onClick={handleLeaveRoom}
            className="w-full py-3 text-[var(--color-text-muted)] hover:text-[var(--color-brand-red)] font-bold rounded-xl transition-colors text-sm flex items-center justify-center"
          >
            <LogOut size={16} className="mr-2" />
            LEAVE ROOM
          </button>
        </div>
      </div>

      {/* Kick Confirmation Modal */}
      <AnimatePresence>
        {showKickModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowKickModal(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[var(--color-surface-card)] border border-[var(--color-surface-border)] rounded-3xl p-6 shadow-2xl relative z-10 w-full max-w-sm text-center"
            >
              <div className="w-16 h-16 bg-[var(--color-brand-red)]/10 text-[var(--color-brand-red)] rounded-full flex items-center justify-center mx-auto mb-4">
                <UserMinus size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Remove Player?</h3>
              <p className="text-[var(--color-text-muted)] mb-8 text-sm">
                Are you sure you want to remove this player? They will not be able to rejoin this room.
              </p>
              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowKickModal(null)}
                  className="flex-1 py-3 bg-[var(--color-surface-bg)] hover:bg-[var(--color-surface-border)] text-white font-bold rounded-xl transition-colors"
                >
                  CANCEL
                </button>
                <button 
                  onClick={confirmKick}
                  className="flex-1 py-3 bg-[var(--color-brand-red)] hover:bg-[var(--color-brand-red-hover)] text-white font-bold rounded-xl transition-colors"
                >
                  REMOVE
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
