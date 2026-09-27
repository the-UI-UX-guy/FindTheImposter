import { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { useSettingsStore } from '../store/settingsStore';
import { getRandomWordAndHint, CATEGORIES } from '../data/words';
import { assignRoles } from '../utils/gameLogic';
import { motion, AnimatePresence } from 'framer-motion';
import { audioManager } from '../utils/audioManager';
import { Plus, X, Users, Clock, Lightbulb, UserX, UserPlus, Play } from 'lucide-react';

export function Setup() {
  const { players, settings, setPlayers, updateSettings, setPhase } = useGameStore();
  const { animationsEnabled } = useSettingsStore();
  const [newPlayerName, setNewPlayerName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const addPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    if (players.length >= 20) {
      alert("Maximum 20 players allowed.");
      return;
    }
    if (players.some(p => p.name.toLowerCase() === newPlayerName.trim().toLowerCase())) {
      alert("That player is already in the game.");
      return;
    }
    
    audioManager.playSelect();
    setPlayers([...players, { id: Date.now().toString(), name: newPlayerName.trim() }]);
    setNewPlayerName('');
    inputRef.current?.focus();
  };

  const removePlayer = (id: string) => {
    audioManager.playSelect();
    setPlayers(players.filter(p => p.id !== id));
  };

  const startGame = () => {
    if (players.length < 3) return;
    if (settings.imposterCount >= players.length) return;

    audioManager.playStartGame();

    const assignedPlayers = assignRoles(players, settings.imposterCount);
    const { secretWord, hintWord } = getRandomWordAndHint(settings.category as any);
    
    useGameStore.setState({
      players: assignedPlayers,
      secretWord,
      hintWord,
      imposters: assignedPlayers.filter(p => p.role === 'IMPOSTER').map(p => p.id),
      currentPlayerIndex: 0,
      phase: 'PLAYER_REVEAL'
    });
  };

  // Ensure imposters isn't higher than max possible
  useEffect(() => {
    if (players.length > 0 && settings.imposterCount >= players.length) {
      updateSettings({ imposterCount: Math.max(1, players.length - 1) });
    }
  }, [players.length, settings.imposterCount, updateSettings]);

  // Generate a color based on string
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-600', 'bg-emerald-600', 'bg-violet-600', 
      'bg-amber-600', 'bg-pink-600', 'bg-cyan-600', 'bg-rose-600'
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col min-h-screen pb-28 pt-6 relative">
      <div className="flex items-center justify-between mb-8 px-4">
        <div>
          <h2 className="text-3xl font-black text-[var(--color-text-main)] tracking-wide">CREATE GAME</h2>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">Gather your crew.</p>
        </div>
        <button 
          onClick={() => { audioManager.playSelect(); setPhase('HOME'); }} 
          className="w-10 h-10 rounded-full bg-[var(--color-surface-card)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-white active:scale-95 transition-all"
        >
          <X size={20} />
        </button>
      </div>

      <div className="space-y-6 px-4">
        
        {/* PLAYERS SECTION */}
        <section className="space-y-4">
          <div className="flex justify-between items-end">
            <div className="flex items-center space-x-2 text-[var(--color-text-muted)]">
              <Users size={18} />
              <h3 className="font-bold uppercase tracking-wider text-sm">Players</h3>
            </div>
            <span className="text-sm font-medium bg-[var(--color-surface-card)] px-2 py-0.5 rounded text-[var(--color-text-muted)]">
              {players.length} / 20
            </span>
          </div>

          <form onSubmit={addPlayer} className="relative">
            <input 
              ref={inputRef}
              type="text" 
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              placeholder="Enter player name..."
              className="w-full bg-[var(--color-surface-card)] text-[var(--color-text-main)] px-5 py-4 pr-14 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-red)] border border-[var(--color-surface-border)] shadow-inner transition-all placeholder:text-[var(--color-text-muted)] placeholder:opacity-50"
            />
            <button 
              type="submit" 
              disabled={!newPlayerName.trim()}
              className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-[var(--color-brand-red)] text-white rounded-xl hover:bg-[var(--color-brand-red-hover)] disabled:opacity-0 transition-all shadow-md"
            >
              <Plus size={20} />
            </button>
          </form>

          <div className="bg-[var(--color-surface-card)] border border-[var(--color-surface-border)] rounded-2xl p-4 min-h-[120px] shadow-lg">
            <AnimatePresence mode="popLayout">
              {players.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full space-y-3 py-6 opacity-60"
                >
                  <UserPlus size={32} className="text-[var(--color-text-muted)]" />
                  <p className="text-[var(--color-text-muted)] text-sm text-center">
                    Add at least 3 players<br/>to start the game.
                  </p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {players.map(p => (
                    <motion.div 
                      key={p.id}
                      layout={animationsEnabled}
                      initial={animationsEnabled ? { opacity: 0, scale: 0.8 } : {}}
                      animate={animationsEnabled ? { opacity: 1, scale: 1 } : {}}
                      exit={animationsEnabled ? { opacity: 0, scale: 0.8 } : {}}
                      className="bg-[var(--color-surface-bg)] border border-[var(--color-surface-border)] rounded-xl p-2 pr-3 flex items-center justify-between group"
                    >
                      <div className="flex items-center space-x-2 overflow-hidden">
                        <div className={`w-8 h-8 rounded-full ${getAvatarColor(p.name)} flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-sm`}>
                          {p.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-[var(--color-text-main)] font-medium truncate text-sm">
                          {p.name}
                        </span>
                      </div>
                      <button 
                        onClick={() => removePlayer(p.id)} 
                        className="text-[var(--color-text-muted)] hover:text-[var(--color-brand-red)] transition-colors p-1"
                      >
                        <X size={16} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* SETTINGS SECTION */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center space-x-2 text-[var(--color-text-muted)]">
            <h3 className="font-bold uppercase tracking-wider text-sm">Game Options</h3>
          </div>
          
          <div className="space-y-3">
            
            {/* Category */}
            <div className="bg-[var(--color-surface-card)] border border-[var(--color-surface-border)] rounded-2xl p-4 flex justify-between items-center shadow-md">
              <div>
                <span className="text-[var(--color-text-main)] font-semibold block">Category</span>
                <span className="text-[var(--color-text-muted)] text-xs">Word collection</span>
              </div>
              <select 
                value={settings.category}
                onChange={(e) => updateSettings({ category: e.target.value })}
                className="bg-[var(--color-surface-bg)] text-[var(--color-text-main)] font-medium px-4 py-2 rounded-xl border border-[var(--color-surface-border)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-red)] appearance-none text-center min-w-[120px]"
              >
                <option value="RANDOM">🎲 Random</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Imposter Count */}
            <div className="bg-[var(--color-surface-card)] border border-[var(--color-surface-border)] rounded-2xl p-4 shadow-md">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <span className="text-[var(--color-text-main)] font-semibold block">Imposters</span>
                  <span className="text-[var(--color-text-muted)] text-xs">How many hiding?</span>
                </div>
                <div className="flex space-x-1">
                  {Array.from({ length: settings.imposterCount }).map((_, i) => (
                    <UserX key={i} size={16} className="text-[var(--color-brand-red)]" />
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {[1,2,3].map(num => {
                  const isDisabled = players.length > 0 && num >= players.length;
                  return (
                    <button 
                      key={num}
                      disabled={isDisabled}
                      onClick={() => updateSettings({ imposterCount: num })}
                      className={`py-2 rounded-xl font-bold transition-all border ${settings.imposterCount === num ? 'bg-[var(--color-brand-red)] border-[var(--color-brand-red)] text-white shadow-[0_0_15px_rgba(225,29,72,0.4)]' : 'bg-[var(--color-surface-bg)] border-[var(--color-surface-border)] text-[var(--color-text-muted)] hover:border-[var(--color-text-muted)]'} ${isDisabled ? 'opacity-30 cursor-not-allowed' : ''}`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Timer */}
            <div className="bg-[var(--color-surface-card)] border border-[var(--color-surface-border)] rounded-2xl p-4 flex justify-between items-center shadow-md">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-[var(--color-surface-bg)] flex items-center justify-center text-[var(--color-brand-blue)] border border-[var(--color-surface-border)]">
                  <Clock size={18} />
                </div>
                <div>
                  <span className="text-[var(--color-text-main)] font-semibold block">Round Timer</span>
                </div>
              </div>
              <select 
                value={settings.timerSeconds}
                onChange={(e) => updateSettings({ timerSeconds: Number(e.target.value) })}
                className="bg-[var(--color-surface-bg)] text-[var(--color-text-main)] font-medium px-4 py-2 rounded-xl border border-[var(--color-surface-border)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-red)] appearance-none text-center"
              >
                <option value={0}>Off</option>
                <option value={60}>1 Min</option>
                <option value={120}>2 Min</option>
                <option value={180}>3 Min</option>
                <option value={300}>5 Min</option>
              </select>
            </div>

            {/* Hint Toggle */}
            <div className="bg-[var(--color-surface-card)] border border-[var(--color-surface-border)] rounded-2xl p-4 flex justify-between items-center shadow-md">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-[var(--color-surface-bg)] flex items-center justify-center text-yellow-500 border border-[var(--color-surface-border)]">
                  <Lightbulb size={18} />
                </div>
                <div>
                  <span className="text-[var(--color-text-main)] font-semibold block">Imposter Hint</span>
                  <span className="text-[var(--color-text-muted)] text-xs">Help the imposter survive</span>
                </div>
              </div>
              <button
                onClick={() => updateSettings({ imposterHint: !settings.imposterHint })}
                className={`w-14 h-8 rounded-full transition-colors relative border ${settings.imposterHint ? 'bg-[var(--color-brand-red)] border-[var(--color-brand-red)]' : 'bg-[var(--color-surface-bg)] border-[var(--color-surface-border)]'}`}
              >
                <div className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full transition-transform ${settings.imposterHint ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

          </div>
        </section>

      </div>

      {/* START GAME BUTTON - STICKY BOTTOM */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)] to-transparent pt-12 z-20">
        <div className="max-w-md mx-auto">
          {players.length < 3 || settings.imposterCount >= players.length ? (
            <div className="w-full py-4 bg-[var(--color-surface-card)] border border-[var(--color-brand-red)]/30 text-[var(--color-brand-red)] font-bold rounded-2xl text-center opacity-80 mb-2 shadow-lg">
              {players.length < 3 ? 'Need at least 3 players' : 'Too many imposters'}
            </div>
          ) : (
            <button 
              onClick={startGame}
              className="w-full py-5 bg-gradient-to-r from-[var(--color-brand-red)] to-[var(--color-brand-red-hover)] text-white font-black rounded-2xl text-xl transition-all shadow-lg hover:shadow-[0_0_20px_rgba(225,29,72,0.4)] active:scale-[0.98] box-glow flex items-center justify-center space-x-3 group"
            >
              <span>START GAME</span>
              <Play className="fill-current w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
