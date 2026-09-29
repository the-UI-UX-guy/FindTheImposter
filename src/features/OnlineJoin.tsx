import { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { useOnlineStore } from '../store/onlineStore';
import { motion, AnimatePresence } from 'framer-motion';
import { audioManager } from '../utils/audioManager';
import { AlertCircle, Lock, User, LogIn } from 'lucide-react';

export function OnlineJoin() {
  const { setPhase } = useGameStore();
  const { connect, roomCode: storeRoomCode } = useOnlineStore();
  
  const [roomCode, setRoomCode] = useState(storeRoomCode || '');
  const [playerName, setPlayerName] = useState('');
  const [password, setPassword] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  
  const [toast, setToast] = useState<string | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // If roomCode isn't provided via state, this component is mounted manually.
    if (!roomCode && storeRoomCode) {
      setRoomCode(storeRoomCode);
    }
  }, [storeRoomCode]);

  const showToast = (message: string) => {
    setToast(message);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToast(null), 3000);
  };

  const handleJoinRoom = () => {
    if (!roomCode.trim()) {
      showToast("Please enter a room code.");
      return;
    }
    if (!playerName.trim()) {
      showToast("Please enter your name.");
      return;
    }
    
    audioManager.playSelect();
    setIsJoining(true);

    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const serverUrl = isLocalhost ? 'http://localhost:3001' : window.location.origin;

    connect(serverUrl);
    
    const socket = useOnlineStore.getState().socket;
    
    if (socket) {
      const timeoutId = setTimeout(() => {
        setIsJoining(false);
        showToast("Connection timed out. Server might be down.");
        useOnlineStore.getState().disconnect();
      }, 5000);

      socket.emit('join-room', {
        roomCode: roomCode.trim().toUpperCase(),
        playerName: playerName.trim(),
        password: password.trim() || null
      }, (response: any) => {
        clearTimeout(timeoutId);
        setIsJoining(false);
        if (response.success) {
          useOnlineStore.getState().setOnlineMode(true);
          useOnlineStore.getState().setRoomInfo(
            response.room.code,
            response.room.players,
            response.room.host,
            response.room.settings
          );
          useOnlineStore.getState().setMyIdentity(response.player.id, response.player.name);
          setPhase('ONLINE_LOBBY');
        } else {
          showToast(response.error || "Failed to join room.");
          useOnlineStore.getState().disconnect();
        }
      });
    } else {
      setIsJoining(false);
      showToast("Connection failed.");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col min-h-[85vh] relative pb-28">
      
      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-12 left-1/2 -translate-x-1/2 bg-[var(--color-brand-red)] text-white px-5 py-3 rounded-full shadow-[0_5px_30px_rgba(225,29,72,0.4)] z-50 flex items-center space-x-2 whitespace-nowrap border border-white/20"
          >
            <AlertCircle size={18} />
            <span className="font-bold text-sm tracking-wide">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-center text-center mb-12 px-4">
        <div>
          <h2 className="text-3xl font-black text-[var(--color-text-main)] tracking-wide">JOIN GAME</h2>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">Enter your details to play.</p>
        </div>
      </div>

      <div className="space-y-6 px-4">
        
        <div className="glass-panel rounded-3xl p-6 border border-[var(--color-surface-border)] shadow-xl relative overflow-hidden group space-y-6">
          <div className="absolute -top-16 -right-16 w-32 h-32 bg-[var(--color-brand-blue)] rounded-full blur-[60px] opacity-10" />
          
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[var(--color-text-muted)] uppercase tracking-widest pl-1">Room Code</h3>
            <input 
              type="text" 
              value={roomCode}
              onChange={e => setRoomCode(e.target.value.toUpperCase())}
              placeholder="e.g. A7K9Q2"
              maxLength={6}
              className="w-full bg-[var(--color-surface-bg)] border border-[var(--color-surface-border)] rounded-2xl px-4 py-4 text-white text-xl tracking-widest font-bold focus:outline-none focus:border-[var(--color-brand-blue)] transition-colors uppercase placeholder:normal-case placeholder:tracking-normal placeholder:font-medium placeholder:text-gray-600"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[var(--color-text-muted)] uppercase tracking-widest pl-1">Your Details</h3>
            <div className="relative">
              <input 
                type="text" 
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                placeholder="Your Name"
                className="w-full bg-[var(--color-surface-bg)] border border-[var(--color-surface-border)] rounded-2xl pl-12 pr-4 py-4 text-white font-medium focus:outline-none focus:border-[var(--color-brand-blue)] transition-colors placeholder:text-gray-600"
              />
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={20} />
            </div>

            <div className="relative">
              <input 
                type="text" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Room Password (if required)"
                className="w-full bg-[var(--color-surface-bg)] border border-[var(--color-surface-border)] rounded-2xl pl-12 pr-4 py-4 text-white font-medium focus:outline-none focus:border-[var(--color-brand-blue)] transition-colors placeholder:text-gray-600"
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={20} />
            </div>
          </div>
        </div>

      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[var(--color-surface-bg)] via-[var(--color-surface-bg)] to-transparent pointer-events-none z-50">
        <div className="max-w-md mx-auto pointer-events-auto">
          <button 
            onClick={handleJoinRoom}
            disabled={isJoining}
            className="w-full py-5 bg-[var(--color-brand-blue)] hover:bg-[var(--color-brand-blue-hover)] text-white font-black rounded-2xl text-xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {isJoining ? (
              <span>JOINING...</span>
            ) : (
              <>
                <LogIn size={24} />
                <span>JOIN ROOM</span>
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
}
