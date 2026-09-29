const roomManager = require('./roomManager');
const { createRoom, joinRoom, getRoom, leaveRoom, kickPlayer, updateSettings, startGame, handleDisconnect } = roomManager;

function initSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Create Room
    socket.on('create-room', (data, callback) => {
      try {
        const { playerName, password, settings } = data;
        const result = createRoom(socket.id, playerName, password, settings);
        socket.join(result.roomCode);
        callback({ success: true, room: result.room, player: result.player });
      } catch (error) {
        callback({ success: false, error: error.message });
      }
    });

    // Join Room
    socket.on('join-room', (data, callback) => {
      try {
        const { roomCode, playerName, password } = data;
        const result = joinRoom(roomCode, socket.id, playerName, password);
        socket.join(result.roomCode);
        
        // Notify others
        socket.to(result.roomCode).emit('player-joined', { player: result.player, room: getRoom(result.roomCode) });
        
        callback({ success: true, room: result.room, player: result.player });
      } catch (error) {
        callback({ success: false, error: error.message });
      }
    });

    // Leave Room
    socket.on('leave-room', (data, callback) => {
      const { roomCode } = data;
      try {
        const room = leaveRoom(roomCode, socket.id);
        socket.leave(roomCode);
        if (room) {
          io.to(roomCode).emit('player-left', { playerId: socket.id, room });
        }
        if (callback) callback({ success: true });
      } catch (error) {
        if (callback) callback({ success: false, error: error.message });
      }
    });

    // Disconnect
    socket.on('kick-player', (data) => {
    try {
      const room = roomManager.kickPlayer(data.roomCode, socket.id, data.targetId);
      // Let the kicked player know so their client can disconnect safely
      io.to(data.targetId).emit('kicked');
      io.to(data.roomCode).emit('player-left', { room });
    } catch (error) {
      console.error(error);
    }
  });

  socket.on('start-game', (data) => {
    try {
      const room = roomManager.startGame(data.roomCode, socket.id);
      
      // Tell everyone the game started and the general room state
      io.to(data.roomCode).emit('game-started', {
        category: room.selectedCategory
      });

      // Privately send each player their role info
      room.players.forEach(p => {
        let privateData = { 
          role: p.role,
          category: room.selectedCategory
        };
        if (p.role === 'CIVILIAN') {
          privateData.secretWord = room.secretWord;
        } else {
          // Send the hint instead
          privateData.hintWord = room.hintWord;
        }
        io.to(p.id).emit('private-role-reveal', privateData);
      });

    } catch (error) {
      console.error('start-game error:', error);
    }
  });

  socket.on('start-clue-phase', (data) => {
    io.to(data.roomCode).emit('start-clue-phase');
  });

  socket.on('finish-clues', (data) => {
    io.to(data.roomCode).emit('finish-clues');
  });

  socket.on('start-voting', (data) => {
    io.to(data.roomCode).emit('start-voting');
  });

  socket.on('submit-vote', (data) => {
    // data: { roomCode, voterId, targetId }
    const room = getRoom(data.roomCode);
    if (room) {
      if (!room.votes) room.votes = {};
      room.votes[data.voterId] = data.targetId;
      
      io.to(data.roomCode).emit('player-voted', { voterId: data.voterId });
      
      if (Object.keys(room.votes).length === room.players.length) {
        // All votes are in
        io.to(data.roomCode).emit('voting-complete', {
          votes: room.votes,
          imposters: room.players.filter(p => p.role === 'IMPOSTER').map(p => p.id),
          secretWord: room.secretWord
        });
      }
    }
  });

  socket.on('submit-final-guess', (data) => {
    io.to(data.roomCode).emit('final-guess-result', { success: data.success, guess: data.guess });
  });

  socket.on('return-to-lobby', (data) => {
    const room = getRoom(data.roomCode);
    if (room) {
      room.inProgress = false;
      room.votes = {};
      io.to(data.roomCode).emit('return-to-lobby');
    }
  });

  socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      // Find which rooms the player was in and handle leave
      // In a more robust setup, we'd iterate over an index of socketId -> roomCode
      // For now, handled by roomManager if we maintain a map.
      // We will implement a quick scan for MVP:
      const { handleDisconnect } = require('./roomManager');
      const updatedRooms = handleDisconnect(socket.id);
      
      updatedRooms.forEach(({ roomCode, room }) => {
        if (room) {
          io.to(roomCode).emit('player-left', { playerId: socket.id, room });
        }
      });
    });
    
    // Additional events will be added here (kick, start, update settings)
  });
}

module.exports = { initSocketHandlers };
