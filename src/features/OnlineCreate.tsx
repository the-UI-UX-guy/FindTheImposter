import { useState, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { useOnlineStore } from '../store/onlineStore';
import { CATEGORIES } from '../data/words';
import { motion, AnimatePresence } from 'framer-motion';
import { audioManager } from '../utils/audioManager';
import { AlertCircle, ChevronDown, Users, Clock, UserX, FolderOpen, Lock } from 'lucide-react';

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

function CustomSelect({ 
  value, 
  options, 
  onChange 
}: { 
  value: string | number, 
  options: { label: string, value: string | number }[], 
  onChange: (val: any) => void
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(o => o.value === value) || options[0];

  return (
    <div className="relative">
      <button 
        type="button"
        onClick={() => { audioManager.playSelect(); setIsOpen(!isOpen); }}
        className="bg-[var(--color-surface-bg)] text-[var(--color-text-main)] font-medium px-4 py-2 rounded-xl border border-[var(--color-surface-border)] flex items-center justify-between min-w-[120px] transition-all hover:border-white/20 active:scale-95 text-sm"
      >
        <span>{selectedOption.label}</span>
        <ChevronDown size={14} className={`ml-2 text-[var(--color-text-muted)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-48 max-h-[220px] overflow-y-auto custom-scrollbar bg-[var(--color-surface-card)] backdrop-blur-xl rounded-xl border border-[var(--color-surface-border)] shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-50 flex flex-col py-1"
            >
              {options.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { audioManager.playSelect(); onChange(opt.value); setIsOpen(false); }}
                  className={`px-4 py-3 text-left transition-colors text-sm ${value === opt.value ? 'bg-[var(--color-brand-blue)]/10 text-[var(--color-brand-blue)] font-bold' : 'text-[var(--color-text-main)] hover:bg-[var(--color-surface-border)]'}`}
                >
                  {opt.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export function OnlineCreate() {
  const { settings, updateSettings, setPhase } = useGameStore();
  const { connect } = useOnlineStore();
  const [hostName, setHostName] = useState('');
  const [password, setPassword] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  const [toast, setToast] = useState<string | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToast(null), 3000);
  };

  const handleCreateRoom = () => {
    if (!hostName.trim()) {
      showToast("Please enter your name.");
      return;
    }
    audioManager.playSelect();
    setIsCreating(true);

    // For local dev, hardcode localhost:3001 if window.location.hostname is localhost
    // Otherwise use window.location.host if served from same origin
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const serverUrl = isLocalhost ? 'http://localhost:3001' : window.location.origin;

    connect(serverUrl);
    
    // Setup listener once connected. It's safe to emit immediately because socket.io buffers it
    const socket = useOnlineStore.getState().socket;
    
    if (socket) {
      // Add a timeout to catch connection failures
      const timeoutId = setTimeout(() => {
        setIsCreating(false);
        showToast("Connection timed out. Server might be down.");
      }, 5000);

      socket.emit('create-room', {
        playerName: hostName.trim(),
        password: password.trim() || null,
        settings
      }, (response: any) => {
        clearTimeout(timeoutId);
        setIsCreating(false);
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
          showToast(response.error || "Failed to create room.");
        }
      });
    } else {
      setIsCreating(false);
      showToast("Connection failed.");
    }
  };

  const categoryOptions = [
    { label: '🎲 Random Category', value: 'RANDOM' },
    ...CATEGORIES.map(c => ({ label: `${CATEGORY_EMOJIS[c] || '▪️'} ${c}`, value: c }))
  ];
  
  const timerOptions = [
    { label: '1 Minute', value: 60 },
    { label: '90 Seconds', value: 90 },
    { label: '2 Minutes', value: 120 },
    { label: '3 Minutes', value: 180 },
    { label: '5 Minutes', value: 300 },
    { label: 'None', value: 0 },
  ];

  const modeOptions = [
    { label: 'Classic', value: 'CLASSIC' },
    { label: 'One Word', value: 'ONE_WORD' },
    { label: 'Two Words', value: 'TWO_WORDS' },
    { label: 'Description', value: 'DESCRIPTION' },
  ];

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

      <div className="flex items-center justify-center text-center mb-8 px-4">
        <div>
          <h2 className="text-3xl font-black text-[var(--color-text-main)] tracking-wide">HOST ROOM</h2>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">Configure your online game.</p>
        </div>
      </div>

      <div className="space-y-6 px-4">
        {/* Host Info */}
        <div className="glass-panel rounded-3xl p-6 border border-[var(--color-surface-border)] shadow-xl relative overflow-hidden group">
          <div className="absolute -top-16 -right-16 w-32 h-32 bg-[var(--color-brand-blue)] rounded-full blur-[60px] opacity-10" />
          
          <h3 className="text-sm font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-4">Host Details</h3>
          
          <div className="space-y-4">
            <input 
              type="text" 
              value={hostName}
              onChange={e => setHostName(e.target.value)}
              placeholder="Your Name (Host)"
              className="w-full bg-[var(--color-surface-bg)] border border-[var(--color-surface-border)] rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-[var(--color-brand-blue)] transition-colors placeholder:text-gray-600 font-medium"
            />
            
            <div className="relative">
              <input 
                type="text" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Room Password (Optional)"
                className="w-full bg-[var(--color-surface-bg)] border border-[var(--color-surface-border)] rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-[var(--color-brand-blue)] transition-colors placeholder:text-gray-600 font-medium"
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={20} />
            </div>
          </div>
        </div>

        {/* Game Rules */}
        <div className="glass-panel rounded-3xl p-6 border border-[var(--color-surface-border)] shadow-xl">
          <h3 className="text-sm font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-6">Game Rules</h3>
          
          <div className="space-y-6">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-[var(--color-surface-bg)] flex items-center justify-center border border-[var(--color-surface-border)]">
                  <FolderOpen size={16} className="text-[var(--color-text-muted)]" />
                </div>
                <span className="text-[var(--color-text-main)] font-medium">Category</span>
              </div>
              <CustomSelect 
                value={settings.category} 
                options={categoryOptions} 
                onChange={(val) => updateSettings({ category: val })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-[var(--color-surface-bg)] flex items-center justify-center border border-[var(--color-surface-border)]">
                  <Users size={16} className="text-[var(--color-text-muted)]" />
                </div>
                <span className="text-[var(--color-text-main)] font-medium">Game Mode</span>
              </div>
              <CustomSelect 
                value={settings.mode} 
                options={modeOptions} 
                onChange={(val) => updateSettings({ mode: val })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-[var(--color-surface-bg)] flex items-center justify-center border border-[var(--color-surface-border)]">
                  <Clock size={16} className="text-[var(--color-text-muted)]" />
                </div>
                <span className="text-[var(--color-text-main)] font-medium">Round Timer</span>
              </div>
              <CustomSelect 
                value={settings.timerSeconds} 
                options={timerOptions} 
                onChange={(val) => updateSettings({ timerSeconds: val })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-[var(--color-surface-bg)] flex items-center justify-center border border-[var(--color-surface-border)]">
                  <UserX size={16} className="text-[var(--color-text-muted)]" />
                </div>
                <span className="text-[var(--color-text-main)] font-medium">Imposters</span>
              </div>
              <div className="flex items-center bg-[var(--color-surface-bg)] rounded-xl border border-[var(--color-surface-border)] p-1">
                <button 
                  onClick={() => { audioManager.playSelect(); updateSettings({ imposterCount: 1 }); }}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${settings.imposterCount === 1 ? 'bg-[var(--color-surface-card)] shadow-sm text-white border border-white/10' : 'text-[var(--color-text-muted)] hover:text-white'}`}
                >
                  1
                </button>
                <button 
                  onClick={() => { audioManager.playSelect(); updateSettings({ imposterCount: 2 }); }}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${settings.imposterCount === 2 ? 'bg-[var(--color-surface-card)] shadow-sm text-[var(--color-brand-red)] border border-[var(--color-brand-red)]/30' : 'text-[var(--color-text-muted)] hover:text-white'}`}
                >
                  2
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[var(--color-surface-bg)] via-[var(--color-surface-bg)] to-transparent pointer-events-none z-50">
        <div className="max-w-md mx-auto pointer-events-auto">
          <button 
            onClick={handleCreateRoom}
            disabled={isCreating}
            className="w-full py-5 bg-[var(--color-brand-blue)] hover:bg-[var(--color-brand-blue-hover)] text-white font-black rounded-2xl text-xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center"
          >
            {isCreating ? "CREATING..." : "CREATE ROOM"}
          </button>
        </div>
      </div>

    </div>
  );
}
