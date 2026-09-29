const { v4: uuidv4 } = require('uuid');

// In-memory store
// rooms: Map<string, RoomObject>
// RoomObject: { id, code, host: socketId, players: [], settings: {}, state, password, kickedPlayers: Set }
const rooms = new Map();

// socketToRoom: Map<socketId, roomCode>
const socketToRoom = new Map();

const generateRoomCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No O, 0, I, 1, S, 5 for readability
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const createRoom = (socketId, hostName, password, settings) => {
  let roomCode;
  do {
    roomCode = generateRoomCode();
  } while (rooms.has(roomCode));

  const hostPlayer = {
    id: socketId,
    name: hostName,
    isHost: true,
    isOnline: true
  };

  const room = {
    id: uuidv4(),
    code: roomCode,
    host: socketId,
    password: password || null,
    players: [hostPlayer],
    kickedPlayers: new Set(),
    state: 'LOBBY',
    settings: settings || {
      mode: 'CLASSIC',
      difficulty: 'EASY',
      imposterCount: 1,
      timerSeconds: 120,
      category: 'RANDOM',
      imposterHint: false,
      showCategoryToImposter: false,
    }
  };

  rooms.set(roomCode, room);
  socketToRoom.set(socketId, roomCode);

  return { roomCode, room: sanitizeRoom(room), player: hostPlayer };
};

const joinRoom = (roomCode, socketId, playerName, password) => {
  const code = roomCode.toUpperCase();
  const room = rooms.get(code);

  if (!room) {
    throw new Error('This room doesn\'t exist or has already closed.');
  }

  if (room.kickedPlayers.has(socketId) || room.kickedPlayers.has(playerName)) { // Basic name-based blacklist for now
    throw new Error('You have been removed from this room.');
  }

  if (room.state !== 'LOBBY') {
    throw new Error('This game has already started.');
  }

  if (room.password && room.password !== password) {
    throw new Error('Incorrect room password.');
  }

  if (room.players.some(p => p.name.toLowerCase() === playerName.toLowerCase())) {
    throw new Error('That name is already being used in this room.');
  }

  if (room.players.length >= 20) { // arbitrary limit
    throw new Error('This room is full.');
  }

  const newPlayer = {
    id: socketId,
    name: playerName,
    isHost: false,
    isOnline: true
  };

  room.players.push(newPlayer);
  socketToRoom.set(socketId, code);

  return { roomCode: code, room: sanitizeRoom(room), player: newPlayer };
};

const leaveRoom = (roomCode, socketId) => {
  const code = roomCode.toUpperCase();
  const room = rooms.get(code);
  
  if (!room) return null;

  socketToRoom.delete(socketId);
  room.players = room.players.filter(p => p.id !== socketId);

  if (room.players.length === 0) {
    rooms.delete(code);
    return null;
  }

  // Host migration
  if (room.host === socketId) {
    room.host = room.players[0].id;
    room.players[0].isHost = true;
  }

  return sanitizeRoom(room);
};

const { getRandomWordAndHint } = require('./words');

const startGame = (roomCode, socketId) => {
  const code = roomCode.toUpperCase();
  const room = rooms.get(code);

  if (!room) throw new Error('Room not found');
  if (room.host !== socketId) throw new Error('Only the host can start the game');
  if (room.players.length < 3) throw new Error('Not enough players to start');
  if (room.players.length <= room.settings.imposterCount) throw new Error('Too many imposters for this player count');

  // Assign roles
  const { secretWord, hintWord, selectedCategory } = getRandomWordAndHint(
    room.settings.category,
    room.settings.difficulty
  );

  room.state = 'PLAYING';
  room.secretWord = secretWord;
  room.hintWord = hintWord;
  room.selectedCategory = selectedCategory;
  room.votes = {};

  // Reset roles
  room.players.forEach(p => {
    p.role = 'CIVILIAN';
    p.hasVoted = false;
    p.votedFor = null;
  });

  // Pick imposters
  const imposterIndices = new Set();
  while (imposterIndices.size < room.settings.imposterCount) {
    imposterIndices.add(Math.floor(Math.random() * room.players.length));
  }

  imposterIndices.forEach(idx => {
    room.players[idx].role = 'IMPOSTER';
  });

  return room;
};

const kickPlayer = (roomCode, hostId, targetId) => {
  const code = roomCode.toUpperCase();
  const room = rooms.get(code);

  if (!room) throw new Error('Room not found');
  if (room.host !== hostId) throw new Error('Only the host can kick players');
  if (hostId === targetId) throw new Error('You cannot kick yourself');

  const targetPlayer = room.players.find(p => p.id === targetId);
  if (targetPlayer) {
    room.kickedPlayers.add(targetId);
    room.kickedPlayers.add(targetPlayer.name.toLowerCase());
  }

  room.players = room.players.filter(p => p.id !== targetId);
  socketToRoom.delete(targetId);

  return sanitizeRoom(room);
};

const handleDisconnect = (socketId) => {
  const roomCode = socketToRoom.get(socketId);
  if (roomCode) {
    const room = leaveRoom(roomCode, socketId);
    return [{ roomCode, room }];
  }
  return [];
};

const getRoom = (roomCode) => {
  const room = rooms.get(roomCode.toUpperCase());
  return room ? sanitizeRoom(room) : null;
};

// Remove password and internal sensitive data before sending to clients
const sanitizeRoom = (room) => {
  const sanitized = { ...room };
  delete sanitized.password;
  delete sanitized.kickedPlayers;
  // Also strip private game data for the global room state broadcast
  delete sanitized.secretWord;
  delete sanitized.hintWord;
  delete sanitized.selectedCategory;
  return sanitized;
};

module.exports = {
  createRoom,
  joinRoom,
  leaveRoom,
  startGame,
  kickPlayer,
  handleDisconnect,
  getRoom
};
