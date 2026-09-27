export type GamePhase = 
  | 'HOME' 
  | 'SETUP' 
  | 'PLAYER_REVEAL' 
  | 'CLUE_INTRO'
  | 'CLUE_PHASE' 
  | 'DISCUSSION' 
  | 'VOTING' 
  | 'RESULTS' 
  | 'FINAL_GUESS'
  | 'HOW_TO_PLAY'
  | 'SETTINGS';

export type GameMode = 'CLASSIC' | 'ONE_WORD' | 'QUESTIONS' | 'DESCRIPTION' | 'TWO_WORDS' | 'CUSTOM';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface Player {
  id: string;
  name: string;
  role?: 'CIVILIAN' | 'IMPOSTER';
  hasVoted?: boolean;
  votedFor?: string; // ID of the player they voted for
}

export interface GameState {
  phase: GamePhase;
  players: Player[];
  settings: {
    mode: GameMode;
    difficulty: Difficulty;
    imposterCount: number;
    timerSeconds: number;
    category: string;
    imposterHint: boolean;
  };
  secretWord: string;
  hintWord: string;
  imposters: string[]; // Player IDs
  currentPlayerIndex: number;
  votes: Record<string, string>; // Voter ID -> Voted For ID
  
  // Actions
  setPhase: (phase: GamePhase) => void;
  setPlayers: (players: Player[]) => void;
  updateSettings: (settings: Partial<GameState['settings']>) => void;
  resetGame: () => void;
}
