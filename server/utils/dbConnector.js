const dns = require('dns');
const mongoose = require('mongoose');
const config = require('../config');

// Configure reliable DNS servers (Google DNS & Cloudflare DNS) for Node.js SRV record lookups
// This fixes Windows / local ISP DNS SRV resolution issues (querySrv ECONNREFUSED) with MongoDB Atlas (mongodb+srv://)
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (dnsErr) {
  console.warn('⚠️ [Database] Custom DNS configuration warning:', dnsErr.message);
}

/**
 * Reusable MongoDB Database Connector Utility
 */
class DatabaseConnector {
  constructor() {
    this.isConnected = false;
    this.uri = null;
    this.setupEventListeners();
  }

  /**
   * Set up Mongoose connection event listeners for status logging
   */
  setupEventListeners() {
    mongoose.connection.on('connected', () => {
      this.isConnected = true;
      console.log('✅ [Database] Connection Status: CONNECTED');
      console.log(`   Host: ${mongoose.connection.host}`);
      console.log(`   Database Name: ${mongoose.connection.name}`);
    });

    mongoose.connection.on('error', (err) => {
      this.isConnected = false;
      console.error(`❌ [Database] Connection Status: ERROR - ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      this.isConnected = false;
      console.log('⚠️ [Database] Connection Status: DISCONNECTED');
    });

    mongoose.connection.on('reconnected', () => {
      this.isConnected = true;
      console.log('🔄 [Database] Connection Status: RECONNECTED');
    });
  }

  /**
   * Connect to MongoDB
   * @param {string} [uri] - Optional custom connection URI (defaults to config.mongodbUri)
   * @param {Object} [options] - Optional mongoose connection options
   * @returns {Promise<typeof mongoose>}
   */
  async connect(uri = config.mongodbUri, options = {}) {
    this.uri = uri;

    console.log('====================================================');
    console.log(`📡 [Database] Connection String: ${this.uri}`);
    console.log('⏳ [Database] Attempting connection to MongoDB...');
    console.log('====================================================');

    try {
      const conn = await mongoose.connect(this.uri, {
        serverSelectionTimeoutMS: 10000,
        ...options
      });

      this.isConnected = true;
      return conn;
    } catch (error) {
      this.isConnected = false;
      console.error(`❌ [Database] Connection Status: FAILED`);
      console.error(`   Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Disconnect from MongoDB
   * @returns {Promise<void>}
   */
  async disconnect() {
    if (this.isConnected) {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('🔌 [Database] Connection closed.');
    }
  }

  /**
   * Get current connection status and details
   * @returns {Object}
   */
  getStatus() {
    const states = {
      0: 'DISCONNECTED',
      1: 'CONNECTED',
      2: 'CONNECTING',
      3: 'DISCONNECTING'
    };

    return {
      isConnected: mongoose.connection.readyState === 1,
      readyState: mongoose.connection.readyState,
      status: states[mongoose.connection.readyState] || 'UNKNOWN',
      connectionString: this.uri || config.mongodbUri,
      host: mongoose.connection.host || null,
      name: mongoose.connection.name || null
    };
  }
}

// Export singleton instance and class
const dbConnector = new DatabaseConnector();

module.exports = {
  dbConnector,
  connectDB: (uri, options) => dbConnector.connect(uri, options),
  disconnectDB: () => dbConnector.disconnect(),
  getDBStatus: () => dbConnector.getStatus()
};
