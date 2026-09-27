import type { Player } from '../types/game';

export const assignRoles = (players: Player[], imposterCount: number): Player[] => {
  // Deep copy players with their role properly typed
  const newPlayers: Player[] = players.map(p => ({ ...p, role: 'CIVILIAN', hasVoted: false, votedFor: undefined }));
  
  // Pick imposters randomly
  const imposterIndices = new Set<number>();
  while (imposterIndices.size < imposterCount && imposterIndices.size < newPlayers.length) {
    imposterIndices.add(Math.floor(Math.random() * newPlayers.length));
  }
  
  imposterIndices.forEach(index => {
    newPlayers[index].role = 'IMPOSTER';
  });
  
  return newPlayers;
};
