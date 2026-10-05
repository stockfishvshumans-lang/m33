const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();

// CORS - Allow GitHub Pages + localhost
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000", "https://stockfishvshumans-lang.github.io"],
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(express.json());

// Serve static frontend in production
app.use(express.static(path.join(__dirname, '../client')));

const server = http.createServer(app);

// Initialize Socket.IO with CORS - M3SH Multiplayer
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000", "https://stockfishvshumans-lang.github.io"],
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// M3SH Game State
const rooms = new Map(); // roomId -> { players, host, gameState }

io.on('connection', (socket) => {
  console.log(`[M3SH] User Connected: ${socket.id} | Total: ${io.engine.clientsCount}`);

  // === LOBBY ===
  socket.on('create_room', ({ roomId, playerName, isHost }) => {
    console.log(`[M3SH] Create Room: ${roomId} by ${playerName}`);
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        id: roomId,
        host: socket.id,
        players: [{ id: socket.id, name: playerName, isHost: true, health: 100, score: 0 }],
        gameMode: 'vs',
        createdAt: Date.now()
      });
    }
    socket.join(roomId);
    io.to(roomId).emit('room_updated', rooms.get(roomId));
  });

  socket.on('join_room', ({ roomId, playerName }) => {
    console.log(`[M3SH] Join Room: ${roomId} by ${playerName}`);
    const room = rooms.get(roomId);
    if (room) {
      // Prevent duplicate join
      if (!room.players.find(p => p.id === socket.id)) {
        room.players.push({ id: socket.id, name: playerName, isHost: false, health: 100, score: 0 });
      }
      socket.join(roomId);
      io.to(roomId).emit('room_updated', room);
      socket.to(roomId).emit('player_joined', { playerId: socket.id, playerName });
    } else {
      socket.emit('error', { message: 'Room not found' });
    }
  });

  // === GAME SYNC - Uses same logic as laptop view ===
  socket.on('send_vs_state', ({ room, state }) => {
    // Broadcast to opponent in same room (excluding sender)
    socket.to(room).emit('receive_vs_state', { playerId: socket.id, state });
  });

  socket.on('player_died', ({ room }) => {
    console.log(`[M3SH] Player died in ${room}: ${socket.id}`);
    socket.to(room).emit('opponent_died', { playerId: socket.id });
  });

  socket.on('use_skill', ({ room, type, isMini, x, y }) => {
    socket.to(room).emit('sync_skill', { playerId: socket.id, type, isMini, x, y });
  });

  socket.on('send_message', (data) => {
    io.emit('receive_message', data);
  });

  // === CLASSROOM ===
  socket.on('classroom_update', ({ roomId, studentData }) => {
    socket.to(roomId).emit('student_progress', { studentId: socket.id, data: studentData });
  });

  socket.on('teacher_command', ({ roomId, command }) => {
    // freeze, unfreeze, force_stop, etc.
    io.to(roomId).emit('classroom_command', { command, teacherId: socket.id });
  });

  // === DISCONNECT ===
  socket.on('disconnect', () => {
    console.log(`[M3SH] User Disconnected: ${socket.id}`);
    // Remove from rooms
    for (const [roomId, room] of rooms.entries()) {
      const idx = room.players.findIndex(p => p.id === socket.id);
      if (idx !== -1) {
        room.players.splice(idx, 1);
        if (room.players.length === 0) {
          rooms.delete(roomId);
          console.log(`[M3SH] Room deleted: ${roomId}`);
        } else {
          // If host left, assign new host
          if (room.host === socket.id && room.players.length > 0) {
            room.host = room.players[0].id;
            room.players[0].isHost = true;
          }
          io.to(roomId).emit('room_updated', room);
          io.to(roomId).emit('player_left', { playerId: socket.id });
        }
      }
    }
  });

  // Cleanup old rooms every 5 min
  socket.on('ping', () => {
    socket.emit('pong');
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'M3SH Server Online', rooms: rooms.size, clients: io.engine.clientsCount });
});

// Fallback to index.html for SPA
app.get('*', (req, res) => {
  const clientPath = path.join(__dirname, '../client/index.html');
  if (require('fs').existsSync(clientPath)) {
    res.sendFile(clientPath);
  } else {
    res.json({ message: 'M3SH API Server', rooms: rooms.size });
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`[M3SH] SERVER IS RUNNING ON PORT ${PORT}`);
  console.log(`[M3SH] Socket.IO ready for M3SH Multiplayer`);
  console.log(`[M3SH] CORS allowed: localhost:5173, localhost:3000, github.io`);
});
