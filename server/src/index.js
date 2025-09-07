import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcryptjs";
import os from "os";
import { createServer } from "http";
import { Server } from "socket.io";

// Models
import User from "./models/User.js";
import Post from "./models/Post.js";
import Message from "./models/Message.js";

// Routes
import userRoutes from "./routes/userRoutes.js";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
const PORT = process.env.PORT || 5000;
const MONGO_URI = "mongodb://127.0.0.1:27017/omnivibe";

// Store online users
const onlineUsers = new Map();

// Middleware
app.use(express.json());

// CORS: allow any device in your LAN (for dev)
app.use(cors({
  origin: "*", // for development only, lock down in production
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// ===== USER ROUTES =====
app.use("/api/users", userRoutes);

// ===== AUTH ROUTES =====

// Register
app.post("/api/register", async (req, res) => {
  const { username, email, password, fullName, avatar } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ message: "All fields required" });

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      fullName,
      avatar,
    });

    res.status(201).json({
      message: "User created",
      user: { id: newUser._id, username, email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ===== POSTS ROUTES =====

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({ message: "Server is working!", timestamp: new Date().toISOString() });
});

// Create a post
app.post("/api/posts", async (req, res) => {
  try {
    const { content, authorId, authorName, authorUsername, authorAvatar } = req.body;
    
    console.log("📝 Creating new post:", { 
      content: content?.substring(0, 50) + "...", 
      authorId,
      authorUsername 
    });
    
    if (!content || !content.trim()) {
      console.log("❌ Empty content");
      return res.status(400).json({ message: "Post content is required" });
    }

    if (!authorId) {
      console.log("❌ Missing author ID");
      return res.status(400).json({ message: "Author ID is required" });
    }

    // Verify the author exists
    const author = await User.findById(authorId);
    if (!author) {
      console.log("❌ Author not found");
      return res.status(404).json({ message: "Author not found" });
    }

    const newPost = await Post.create({
      content: content.trim(),
      author: authorId, // Required field for the schema
      authorName: authorName?.trim() || author.fullName || author.username,
      authorUsername: authorUsername?.trim() || author.username,
      authorAvatar: authorAvatar || author.avatar || null,
      likes: [],
      reposts: [],
      stores: [],
      comments: []
    });

    console.log("✅ Post created successfully:", newPost._id);
    console.log("📋 Created post details:", {
      id: newPost._id,
      author: newPost.author,
      authorUsername: newPost.authorUsername,
      content: newPost.content?.substring(0, 50) + '...'
    });
    res.status(201).json(newPost);
  } catch (err) {
    console.error("❌ Error creating post:", err);
    res.status(500).json({ 
      message: "Error creating post",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Get all posts (Feed) or posts by specific user
app.get("/api/posts", async (req, res) => {
  try {
    const { username } = req.query;
    
    let query = {};
    
    // If username is provided, filter posts by that user
    if (username) {
      console.log(`📋 Fetching posts for user: ${username}`);
      
      // Find the user by username first
      const user = await User.findOne({ username: username });
      if (!user) {
        console.log(`❌ User not found: ${username}`);
        return res.json([]); // Return empty array if user not found
      }
      
      console.log(`✅ Found user: ${user.username} (ID: ${user._id})`);
      
      // Filter posts by author ID (primary) and authorUsername (fallback)
      query.$or = [
        { author: user._id },
        { authorUsername: username }
      ];
      console.log(`🔍 Query filter:`, query);
    } else {
      console.log("📋 Fetching all posts (feed)");
    }
    
    const posts = await Post.find(query)
      .populate('author', 'username fullName avatar')
      .sort({ createdAt: -1 });
    
    console.log(`✅ Found ${posts.length} posts`);
    
    // Debug: Log first few posts to see their structure
    if (posts.length > 0) {
      console.log(`🔍 Sample post structure:`, {
        id: posts[0]._id,
        author: posts[0].author,
        authorUsername: posts[0].authorUsername,
        content: posts[0].content?.substring(0, 50) + '...'
      });
    }
    
    res.json(posts);
  } catch (err) {
    console.error("❌ Error fetching posts:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete a post
app.delete("/api/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Delete request for post ID: ${id}`);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid post ID format" });
    }

    const deletedPost = await Post.findByIdAndDelete(id);
    if (!deletedPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json({ message: "Post deleted successfully", deletedPost });
  } catch (err) {
    console.error("❌ Error deleting post:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ===== MESSAGE SEARCH ENDPOINTS =====

// Search messages in a conversation
app.get("/api/messages/search/:conversationId", async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { q, page = 1, limit = 20 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: "Search query must be at least 2 characters" });
    }

    const searchQuery = {
      conversationId,
      content: { $regex: q, $options: 'i' },
      deleted: { $ne: true }
    };

    const messages = await Message.find(searchQuery)
      .populate('sender', 'username fullName avatar')
      .populate('receiver', 'username fullName avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Message.countDocuments(searchQuery);

    res.json({
      messages,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error searching messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search messages across all conversations for a user
app.get("/api/messages/search/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { q, page = 1, limit = 20 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: "Search query must be at least 2 characters" });
    }

    const searchQuery = {
      $or: [
        { sender: userId },
        { receiver: userId }
      ],
      content: { $regex: q, $options: 'i' },
      deleted: { $ne: true }
    };

    const messages = await Message.find(searchQuery)
      .populate('sender', 'username fullName avatar')
      .populate('receiver', 'username fullName avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Message.countDocuments(searchQuery);

    res.json({
      messages,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error searching user messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== FALLBACK =====
app.use((req, res) => res.status(404).json({ message: "Endpoint not found" }));

// ===== SOCKET.IO MIDDLEWARE =====
io.use((socket, next) => {
  // Authentication middleware
  const token = socket.handshake.auth.token;
  const userId = socket.handshake.auth.userId;
  
  if (!userId) {
    return next(new Error('Authentication error: User ID required'));
  }
  
  // Store user info in socket
  socket.userId = userId;
  socket.username = socket.handshake.auth.username;
  
  next();
});

// ===== SOCKET.IO SETUP =====
io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.id} (User: ${socket.username})`);

  // Handle user login
  socket.on('user_login', async (userData) => {
    try {
      const { userId, username } = userData;
      
      // Store user info with socket ID
      onlineUsers.set(socket.id, { 
        userId, 
        username, 
        socketId: socket.id,
        lastSeen: new Date(),
        status: 'online'
      });
      
      // Join user to their personal room
      socket.join(`user_${userId}`);
      
      // Join user to general online users room
      socket.join('online_users');
      
      // Broadcast to all users that this user is online
      socket.broadcast.emit('user_online', { 
        userId, 
        username,
        lastSeen: new Date(),
        status: 'online'
      });
      
      // Send list of online users to the newly connected user
      const onlineUsersList = Array.from(onlineUsers.values());
      socket.emit('online_users', onlineUsersList);
      
      // Send user's own status
      socket.emit('user_status_update', {
        userId,
        status: 'online',
        lastSeen: new Date()
      });
      
      console.log(`👤 User ${username} (${userId}) is now online`);
    } catch (error) {
      console.error('Error handling user login:', error);
      socket.emit('error', { message: 'Failed to login user' });
    }
  });

  // Handle sending messages
  socket.on('send_message', async (messageData) => {
    try {
      const { senderId, receiverId, content, conversationId, messageType = 'text', replyTo } = messageData;
      
      // Validate message data
      if (!senderId || !receiverId || !content) {
        return socket.emit('message_error', { error: 'Invalid message data' });
      }

      // Create message with enhanced data
      const message = new Message({
        sender: senderId,
        receiver: receiverId,
        content: content.trim(),
        conversationId,
        messageType,
        replyTo,
        status: 'sent',
        timestamp: new Date()
      });

      await message.save();
      await message.populate('sender', 'username fullName avatar');
      await message.populate('receiver', 'username fullName avatar');
      
      // Find receiver socket
      const receiverSocket = Array.from(onlineUsers.entries())
        .find(([_, user]) => user.userId === receiverId)?.[0];
      
      // Send message to receiver if they're online
      if (receiverSocket) {
        io.to(receiverSocket).emit('receive_message', {
          ...message.toObject(),
          status: 'delivered'
        });
        
        // Update message status to delivered
        message.status = 'delivered';
        await message.save();
      }
      
      // Send confirmation back to sender
      socket.emit('message_sent', {
        ...message.toObject(),
        status: 'sent'
      });
      
      // Join both users to conversation room for real-time updates
      socket.join(`conversation_${conversationId}`);
      if (receiverSocket) {
        io.sockets.sockets.get(receiverSocket)?.join(`conversation_${conversationId}`);
      }
      
      // Broadcast to conversation room
      io.to(`conversation_${conversationId}`).emit('conversation_update', {
        conversationId,
        lastMessage: message,
        timestamp: new Date()
      });
      
      console.log(`💬 Message sent from ${senderId} to ${receiverId} (Type: ${messageType})`);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('message_error', { error: 'Failed to send message' });
    }
  });

  // Handle typing indicators
  socket.on('typing_start', (data) => {
    const { receiverId, senderId, conversationId } = data;
    socket.to(`user_${receiverId}`).emit('user_typing', { 
      senderId, 
      isTyping: true,
      conversationId,
      timestamp: new Date()
    });
  });

  socket.on('typing_stop', (data) => {
    const { receiverId, senderId, conversationId } = data;
    socket.to(`user_${receiverId}`).emit('user_typing', { 
      senderId, 
      isTyping: false,
      conversationId,
      timestamp: new Date()
    });
  });

  // Handle message read status
  socket.on('mark_message_read', async (data) => {
    try {
      const { messageId, userId } = data;
      
      // Update message status to read
      await Message.findByIdAndUpdate(messageId, { 
        status: 'read',
        readAt: new Date()
      });
      
      // Notify sender that message was read
      const message = await Message.findById(messageId).populate('sender');
      if (message && message.sender._id.toString() !== userId) {
        const senderSocket = Array.from(onlineUsers.entries())
          .find(([_, user]) => user.userId === message.sender._id.toString())?.[0];
        
        if (senderSocket) {
          io.to(senderSocket).emit('message_read', {
            messageId,
            readBy: userId,
            readAt: new Date()
          });
        }
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  });

  // Handle message reactions
  socket.on('add_reaction', async (data) => {
    try {
      const { messageId, userId, reaction } = data;
      
      const message = await Message.findById(messageId);
      if (!message) return;
      
      // Add or update reaction
      if (!message.reactions) {
        message.reactions = new Map();
      }
      
      message.reactions.set(userId, reaction);
      await message.save();
      
      // Broadcast reaction to conversation
      socket.to(`conversation_${message.conversationId}`).emit('message_reaction', {
        messageId,
        userId,
        reaction,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  });

  // Handle message forwarding
  socket.on('forward_message', async (data) => {
    try {
      const { originalMessageId, forwardToUsers, senderId } = data;
      
      const originalMessage = await Message.findById(originalMessageId)
        .populate('sender', 'username fullName avatar');
      
      if (!originalMessage) return;
      
      // Forward to multiple users
      for (const receiverId of forwardToUsers) {
        const conversationId = [senderId, receiverId].sort().join('_');
        
        const forwardedMessage = new Message({
          sender: senderId,
          receiver: receiverId,
          content: originalMessage.content,
          conversationId,
          messageType: 'forwarded',
          originalMessage: originalMessageId,
          status: 'sent'
        });
        
        await forwardedMessage.save();
        await forwardedMessage.populate('sender', 'username fullName avatar');
        
        // Send to receiver if online
        const receiverSocket = Array.from(onlineUsers.entries())
          .find(([_, user]) => user.userId === receiverId)?.[0];
        
        if (receiverSocket) {
          io.to(receiverSocket).emit('receive_message', forwardedMessage);
        }
      }
      
      socket.emit('message_forwarded', { success: true });
    } catch (error) {
      console.error('Error forwarding message:', error);
      socket.emit('message_error', { error: 'Failed to forward message' });
    }
  });

  // Handle user status updates
  socket.on('update_status', (data) => {
    const { status } = data;
    const user = onlineUsers.get(socket.id);
    
    if (user) {
      user.status = status;
      user.lastSeen = new Date();
      
      // Broadcast status update
      socket.broadcast.emit('user_status_update', {
        userId: user.userId,
        status,
        lastSeen: user.lastSeen
      });
    }
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    const user = onlineUsers.get(socket.id);
    if (user) {
      onlineUsers.delete(socket.id);
      
      // Broadcast that user is offline
      socket.broadcast.emit('user_offline', { userId: user.userId, username: user.username });
      
      console.log(`👋 User ${user.username} (${user.userId}) disconnected`);
    }
  });
});

// ===== CONNECT DB & START SERVER =====
async function startServer() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");

    // Get LAN IP for mobile
    const interfaces = os.networkInterfaces();
    let localIP = "localhost";
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === "IPv4" && !iface.internal) {
          localIP = iface.address;
        }
      }
    }

    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`🚀 Mobile/LAN access: http://${localIP}:${PORT}`);
      console.log(`🔌 Socket.IO server ready`);
    });

  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
}

startServer();

// Graceful shutdown
process.on("SIGINT", async () => {
  await mongoose.disconnect();
  console.log("MongoDB disconnected due to app termination");
  process.exit(0);
});
