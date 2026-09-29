const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const config = require('./config');
const { connectDB } = require('./utils/dbConnector');
const userModel = require('./models/userModel');
const apiRoutes = require('./routes');
const { errorHandler } = require('./middlewares/errorMiddleware');
const { sendError } = require('./utils/responseUtil');
const { initSocketHandlers } = require('./socketHandlers');

const app = express();

// Middlewares
app.use(cors({ origin: config.cors.origin }));
app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

// Root health check endpoint for legacy/simple checks
app.get('/health', (req, res) => {
  res.redirect('/api/health');
});

// 404 Route Handler
app.use((req, res) => {
  sendError(res, `Route '${req.method} ${req.originalUrl}' not found.`, 404);
});

// Global Error Handler Middleware
app.use(errorHandler);

// HTTP and Socket.IO Server
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: config.cors.origin,
    methods: ['GET', 'POST']
  }
});

// Initialize socket handlers
initSocketHandlers(io);

// Start Server and Database Connection
const startServer = async () => {
  try {
    // Connect to MongoDB using reusable connector
    await connectDB(config.mongodbUri);

    // Initialize default admin account if not present
    await userModel.initDefaultAdmin();
  } catch (dbErr) {
    console.warn(`⚠️ [Database] Proceeding without active MongoDB connection: ${dbErr.message}`);
  }

  const PORT = config.port;
  server.listen(PORT, () => {
    console.log(`🚀 Server running in ${config.nodeEnv} mode on port ${PORT}`);
  });
};

startServer();

module.exports = { app, server };
