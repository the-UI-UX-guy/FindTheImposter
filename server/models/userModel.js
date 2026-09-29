const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const { hashPassword } = require('../utils/passwordUtil');

/**
 * Mongoose User Schema definition
 */
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required']
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    }
  },
  {
    timestamps: true
  }
);

// Check if mongoose model already exists
const User = mongoose.models.User || mongoose.model('User', userSchema);

/**
 * User Repository & Model Layer
 * Provides clean async methods for the MVC controllers with MongoDB persistence
 * and resilient memory fallback for offline/test mode.
 */
class UserModel {
  constructor() {
    this.User = User;
    this.memoryStore = new Map();
    this.initDefaultAdmin();
  }

  isDbConnected() {
    return mongoose.connection.readyState === 1;
  }

  /**
   * Initialize default admin user
   */
  async initDefaultAdmin() {
    try {
      const adminPasswordHash = await hashPassword('Admin@123');
      
      // If MongoDB is connected, ensure admin exists in DB
      if (this.isDbConnected()) {
        const adminExists = await this.User.findOne({ username: 'admin' });
        if (!adminExists) {
          const admin = new this.User({
            username: 'admin',
            email: 'admin@imposter.app',
            password: adminPasswordHash,
            role: 'admin'
          });
          await admin.save();
          console.log('👑 [UserModel] Default admin user initialized in MongoDB (admin@imposter.app)');
        }
      }

      // Also ensure memory store has admin for fallback/offline
      const adminId = 'admin-default-id-001';
      this.memoryStore.set(adminId, {
        id: adminId,
        username: 'admin',
        email: 'admin@imposter.app',
        password: adminPasswordHash,
        role: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn('⚠️ [UserModel] Default admin init notice:', err.message);
    }
  }

  /**
   * Sanitize user object to never leak passwords
   * @param {Object} user 
   * @returns {Object|null}
   */
  sanitizeUser(user) {
    if (!user) return null;
    const userObj = user.toObject ? user.toObject() : { ...user };
    const { password, __v, ...safeUser } = userObj;
    if (safeUser._id) {
      safeUser.id = safeUser._id.toString();
    }
    return safeUser;
  }

  /**
   * Create a new user
   * @param {Object} userData 
   * @returns {Promise<Object>}
   */
  async create({ username, email, password, role = 'user' }) {
    const hashedPassword = await hashPassword(password);
    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanRole = role.toLowerCase();

    if (this.isDbConnected()) {
      const user = new this.User({
        username: cleanUsername,
        email: cleanEmail,
        password: hashedPassword,
        role: cleanRole
      });
      const savedUser = await user.save();
      return this.sanitizeUser(savedUser);
    }

    // In-memory fallback
    const id = uuidv4();
    const now = new Date().toISOString();
    const memoryUser = {
      id,
      username: cleanUsername,
      email: cleanEmail,
      password: hashedPassword,
      role: cleanRole,
      createdAt: now,
      updatedAt: now
    };
    this.memoryStore.set(id, memoryUser);
    return this.sanitizeUser(memoryUser);
  }

  /**
   * Find user by ID
   * @param {string} id 
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    if (this.isDbConnected() && mongoose.Types.ObjectId.isValid(id)) {
      try {
        const user = await this.User.findById(id);
        if (user) return user;
      } catch {}
    }

    // Memory fallback
    const memUser = this.memoryStore.get(id);
    return memUser ? { ...memUser } : null;
  }

  /**
   * Find user by email
   * @param {string} email 
   * @returns {Promise<Object|null>}
   */
  async findByEmail(email) {
    if (!email) return null;
    const cleanEmail = email.trim().toLowerCase();

    if (this.isDbConnected()) {
      const user = await this.User.findOne({ email: cleanEmail });
      if (user) return user;
    }

    // Memory fallback
    for (const user of this.memoryStore.values()) {
      if (user.email.toLowerCase() === cleanEmail) {
        return { ...user };
      }
    }
    return null;
  }

  /**
   * Find user by username
   * @param {string} username 
   * @returns {Promise<Object|null>}
   */
  async findByUsername(username) {
    if (!username) return null;
    const cleanUsername = username.trim();

    if (this.isDbConnected()) {
      const user = await this.User.findOne({ username: cleanUsername });
      if (user) return user;
    }

    // Memory fallback
    for (const user of this.memoryStore.values()) {
      if (user.username.toLowerCase() === cleanUsername.toLowerCase()) {
        return { ...user };
      }
    }
    return null;
  }

  /**
   * Find user by either email or username
   * @param {string} identifier 
   * @returns {Promise<Object|null>}
   */
  async findByIdentifier(identifier) {
    if (!identifier) return null;
    const cleanIdentifier = identifier.trim();

    if (this.isDbConnected()) {
      const user = await this.User.findOne({
        $or: [
          { email: cleanIdentifier.toLowerCase() },
          { username: cleanIdentifier }
        ]
      });
      if (user) return user;
    }

    // Memory fallback
    const norm = cleanIdentifier.toLowerCase();
    for (const user of this.memoryStore.values()) {
      if (user.email.toLowerCase() === norm || user.username.toLowerCase() === norm) {
        return { ...user };
      }
    }
    return null;
  }

  /**
   * Get all users (sanitized)
   * @returns {Promise<Array<Object>>}
   */
  async findAll() {
    if (this.isDbConnected()) {
      const users = await this.User.find().sort({ createdAt: -1 });
      return users.map(u => this.sanitizeUser(u));
    }

    // Memory fallback
    return Array.from(this.memoryStore.values()).map(u => this.sanitizeUser(u));
  }

  /**
   * Update user role
   * @param {string} id 
   * @param {string} role 
   * @returns {Promise<Object|null>}
   */
  async updateRole(id, role) {
    const cleanRole = role.toLowerCase();

    if (this.isDbConnected() && mongoose.Types.ObjectId.isValid(id)) {
      try {
        const user = await this.User.findByIdAndUpdate(
          id,
          { role: cleanRole },
          { new: true, runValidators: true }
        );
        if (user) return this.sanitizeUser(user);
      } catch {}
    }

    // Memory fallback
    const memUser = this.memoryStore.get(id);
    if (memUser) {
      memUser.role = cleanRole;
      memUser.updatedAt = new Date().toISOString();
      this.memoryStore.set(id, memUser);
      return this.sanitizeUser(memUser);
    }

    return null;
  }

  /**
   * Delete user
   * @param {string} id 
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    if (this.isDbConnected() && mongoose.Types.ObjectId.isValid(id)) {
      const result = await this.User.findByIdAndDelete(id);
      return !!result;
    }
    return this.memoryStore.delete(id);
  }
}

// Singleton repository instance
module.exports = new UserModel();
