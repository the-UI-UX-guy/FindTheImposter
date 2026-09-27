import { create } from 'zustand';
import type { GameState } from '../types/game';

const initialSettings = {
  mode: 'CLASSIC' as const,
  difficulty: 'EASY' as const,
  imposterCount: 1,
  timerSeconds: 0,
  category: 'RANDOM',
  imposterHint: false,
};

export const useGameStore = create<GameState>((set) => ({
  phase: 'HOME',
  players: [],
  settings: {
    ...initialSettings,
    timerSeconds: 120, // 2 minutes default
  },
  secretWord: '',
  hintWord: '',
  imposters: [],
  currentPlayerIndex: 0,
  votes: {},

  setPhase: (phase) => set({ phase }),
  
  setPlayers: (players) => set({ players }),
  
  updateSettings: (newSettings) => set((state) => ({
    settings: { ...state.settings, ...newSettings }
  })),

  resetGame: () => set({
    phase: 'HOME',
    secretWord: '',
    imposters: [],
    currentPlayerIndex: 0,
    votes: {},
  })
}));
