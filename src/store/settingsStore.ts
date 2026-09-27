import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  soundEnabled: boolean;
  animationsEnabled: boolean;
  darkModeEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  setAnimationsEnabled: (val: boolean) => void;
  setDarkModeEnabled: (val: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      soundEnabled: true,
      animationsEnabled: true,
      darkModeEnabled: true,
      setSoundEnabled: (val) => set({ soundEnabled: val }),
      setAnimationsEnabled: (val) => set({ animationsEnabled: val }),
      setDarkModeEnabled: (val) => set({ darkModeEnabled: val }),
    }),
    {
      name: 'imposter-global-settings',
    }
  )
);
