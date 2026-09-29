import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import type { Player } from '../types/game';

interface OnlineState {
  isOnline: boolean;
  socket: Socket | null;
  
  // Room Info
  roomCode: string | null;
  isHost: boolean;
  onlinePlayers: Player[];
  roomSettings: any | null; // will match gameStore settings
  
  // Player identity
  myPlayerId: string | null;
  myPlayerName: string;
  
  // Game Data
  privateRole: 'CIVILIAN' | 'IMPOSTER' | null;
  privateSecretWord: string | null;
  privateHintWord: string | null;
  selectedCategory: string | null;
  
  // Actions
  connect: (url: string) => void;
  disconnect: () => void;
  
  setOnlineMode: (isOnline: boolean) => void;
  setRoomInfo: (code: string, players: Player[], hostId: string, settings: any) => void;
  setMyIdentity: (id: string, name: string) => void;
  updatePlayers: (players: Player[]) => void;
  setGameData: (role: 'CIVILIAN'|'IMPOSTER', word: string|null, hint: string|null, category: string) => void;
}

export const useOnlineStore = create<OnlineState>((set, get) => ({
  isOnline: false,
  socket: null,
  
  roomCode: null,
  isHost: false,
  onlinePlayers: [],
  roomSettings: null,
  
  myPlayerId: null,
  myPlayerName: '',
  
  privateRole: null,
  privateSecretWord: null,
  privateHintWord: null,
  selectedCategory: null,
  
  connect: (url) => {
    const currentSocket = get().socket;
    if (currentSocket) currentSocket.disconnect();
    
    const socket = io(url);
    set({ socket });
    
    // Default listeners could be added here, but usually better in a hook
  },
  
  disconnect: () => {
    const socket = get().socket;
    if (socket) socket.disconnect();
    set({ socket: null, isOnline: false, roomCode: null, onlinePlayers: [] });
  },
  
  setOnlineMode: (isOnline) => set({ isOnline }),
  
  setRoomInfo: (code, players, hostId, settings) => {
    const myId = get().myPlayerId;
    set({
      roomCode: code,
      onlinePlayers: players,
      roomSettings: settings,
      isHost: myId === hostId
    });
  },
  
  setMyIdentity: (id, name) => set({ myPlayerId: id, myPlayerName: name }),
  
  updatePlayers: (players) => {
    const myId = get().myPlayerId;
    const host = players.find(p => (p as any).isHost);
    set({ 
      onlinePlayers: players,
      isHost: host && myId ? host.id === myId : false
    });
  },
  
  setGameData: (role, word, hint, category) => set({
    privateRole: role,
    privateSecretWord: word,
    privateHintWord: hint,
    selectedCategory: category
  })
}));
