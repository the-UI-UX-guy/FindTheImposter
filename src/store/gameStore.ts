import { create } from 'zustand';
import type { GameState } from '../types/game';

const initialSettings = {
  mode: 'CLASSIC' as const,
  difficulty: 'EASY' as const,
  imposterCount: 1,
  timerSeconds: 0,
  category: 'RANDOM',
  imposterHint: false,
  showCategoryToImposter: false,
};

export const useGameStore = create<GameState>((set) => ({
  phase: 'HOME',
  previousPhase: null,
  players: [],
  settings: {
    ...initialSettings,
    timerSeconds: 120, // 2 minutes default
  },
  secretWord: '',
  hintWord: '',
  selectedCategory: '',
  imposters: [],
  currentPlayerIndex: 0,
  votes: {},

  setPhase: (phase) => set((state) => ({ previousPhase: state.phase, phase })),
  
  setPlayers: (players) => set({ players }),
  
  updateSettings: (newSettings) => set((state) => ({
    settings: { ...state.settings, ...newSettings }
  })),

  resetGame: () => set({
    phase: 'HOME',
    previousPhase: null,
    secretWord: '',
    selectedCategory: '',
    imposters: [],
    currentPlayerIndex: 0,
    votes: {},
  })
}));
