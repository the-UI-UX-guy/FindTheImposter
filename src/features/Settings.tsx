import { useState, useRef } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { motion, AnimatePresence } from 'framer-motion';
import { audioManager } from '../utils/audioManager';
import { 
  ChevronDown, 
  Globe, 
  FileText, 
  ShieldCheck, 
  MessageCircle, 
  ExternalLink,
  AlertCircle
} from 'lucide-react';

function SettingsSelect({ 
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
                  className={`px-4 py-3 text-left transition-colors text-sm ${value === opt.value ? 'bg-[var(--color-brand-red)]/10 text-[var(--color-brand-red)] font-bold' : 'text-[var(--color-text-main)] hover:bg-[var(--color-surface-border)]'}`}
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

export function Settings() {
  const { 
    soundEnabled, setSoundEnabled, 
    animationsEnabled, setAnimationsEnabled,
    darkModeEnabled, setDarkModeEnabled,
    language, setLanguage
  } = useSettingsStore();

  const [toast, setToast] = useState<string | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToast(null), 3000);
  };

  const handleLinkClick = (name: string) => {
    audioManager.playSelect();
    showToast(`Opening ${name}...`);
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col space-y-6 pb-20 relative">
      
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

      <div className="flex justify-center">
        <h2 className="text-3xl font-bold text-[var(--color-text-main)]">Settings</h2>
      </div>

      <div className="space-y-4">
        {/* GAMEPLAY PREFERENCES */}
        <h3 className="text-[var(--color-text-muted)] text-sm font-bold uppercase tracking-widest pl-2">Preferences</h3>
        <div className="bg-[var(--color-surface-card)] p-6 rounded-3xl border border-[var(--color-surface-border)] space-y-8 shadow-md">
          
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-[var(--color-text-main)] font-semibold text-lg">Sound Effects</h3>
              <p className="text-sm text-[var(--color-text-muted)]">Play sounds during the game</p>
            </div>
            <button 
              onClick={() => { audioManager.playSelect(); setSoundEnabled(!soundEnabled); }}
              className={`w-14 h-8 rounded-full relative transition-colors border ${soundEnabled ? 'bg-[var(--color-brand-red)] border-[var(--color-brand-red)]' : 'bg-[var(--color-surface-bg)] border-[var(--color-surface-border)]'}`}
            >
              <div className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full transition-transform ${soundEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-[var(--color-text-main)] font-semibold text-lg">Animations</h3>
              <p className="text-sm text-[var(--color-text-muted)]">Enable UI animations</p>
            </div>
            <button 
              onClick={() => { audioManager.playSelect(); setAnimationsEnabled(!animationsEnabled); }}
              className={`w-14 h-8 rounded-full relative transition-colors border ${animationsEnabled ? 'bg-[var(--color-brand-red)] border-[var(--color-brand-red)]' : 'bg-[var(--color-surface-bg)] border-[var(--color-surface-border)]'}`}
            >
              <div className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full transition-transform ${animationsEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-[var(--color-text-main)] font-semibold text-lg">Dark Mode</h3>
              <p className="text-sm text-[var(--color-text-muted)]">Game theme</p>
            </div>
            <button 
              onClick={() => { audioManager.playSelect(); setDarkModeEnabled(!darkModeEnabled); }}
              className={`w-14 h-8 rounded-full relative transition-colors border ${darkModeEnabled ? 'bg-[var(--color-brand-red)] border-[var(--color-brand-red)]' : 'bg-[var(--color-surface-bg)] border-[var(--color-surface-border)]'}`}
            >
              <div className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full transition-transform ${darkModeEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-[var(--color-surface-border)]">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-[var(--color-surface-bg)] flex items-center justify-center text-blue-500 border border-[var(--color-surface-border)]">
                <Globe size={18} />
              </div>
              <div>
                <h3 className="text-[var(--color-text-main)] font-semibold">Language</h3>
              </div>
            </div>
            <SettingsSelect 
              value={language}
              onChange={(val) => setLanguage(val)}
              options={[
                { label: '🇺🇸 English', value: 'en' },
                { label: '🇪🇸 Español', value: 'es' },
                { label: '🇫🇷 Français', value: 'fr' },
                { label: '🇩🇪 Deutsch', value: 'de' },
              ]}
            />
          </div>

        </div>

        {/* LEGAL & SUPPORT */}
        <h3 className="text-[var(--color-text-muted)] text-sm font-bold uppercase tracking-widest pl-2 pt-4">About</h3>
        <div className="bg-[var(--color-surface-card)] rounded-3xl border border-[var(--color-surface-border)] shadow-md overflow-hidden">
          
          <button onClick={() => handleLinkClick("Terms of Use")} className="w-full p-5 flex items-center justify-between border-b border-[var(--color-surface-border)] hover:bg-[var(--color-surface-bg)] transition-colors group">
            <div className="flex items-center space-x-3 text-[var(--color-text-main)]">
              <FileText size={18} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-brand-red)] transition-colors" />
              <span className="font-semibold">Terms of Use</span>
            </div>
            <ExternalLink size={16} className="text-[var(--color-text-muted)]" />
          </button>

          <button onClick={() => handleLinkClick("Privacy Policy")} className="w-full p-5 flex items-center justify-between border-b border-[var(--color-surface-border)] hover:bg-[var(--color-surface-bg)] transition-colors group">
            <div className="flex items-center space-x-3 text-[var(--color-text-main)]">
              <ShieldCheck size={18} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-brand-red)] transition-colors" />
              <span className="font-semibold">Privacy Policy</span>
            </div>
            <ExternalLink size={16} className="text-[var(--color-text-muted)]" />
          </button>

          <button onClick={() => handleLinkClick("Support")} className="w-full p-5 flex items-center justify-between hover:bg-[var(--color-surface-bg)] transition-colors group">
            <div className="flex items-center space-x-3 text-[var(--color-text-main)]">
              <MessageCircle size={18} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-brand-red)] transition-colors" />
              <span className="font-semibold">Help & Support</span>
            </div>
            <ExternalLink size={16} className="text-[var(--color-text-muted)]" />
          </button>

        </div>
      </div>
      
      <p className="text-center text-[var(--color-text-muted)] text-sm mt-8 opacity-60">
        Settings are automatically saved.<br/>
        Imposter App v1.2.0
      </p>
    </div>
  );
}
