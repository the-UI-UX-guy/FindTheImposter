const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { initSocketHandlers } = require('./socketHandlers');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*', // For dev, allow all. In production, restrict to frontend domain.
    methods: ['GET', 'POST']
  }
});

// Basic health check
app.get('/health', (req, res) => {
  res.status(200).send('Server is running');
});

// Initialize socket handlers
initSocketHandlers(io);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
