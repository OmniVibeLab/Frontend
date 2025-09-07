import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.currentUser = null;
    this.onlineUsers = [];
    this.messageHandlers = new Map();
    this.typingHandlers = new Map();
  }

  // Connect to Socket.IO server
  connect(userData) {
    if (this.socket && this.isConnected) {
      console.log('Socket already connected');
      return;
    }

    this.currentUser = userData;
    this.socket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      auth: {
        userId: userData.id,
        username: userData.username,
        token: userData.token || 'default-token'
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000
    });

    this.socket.on('connect', () => {
      console.log('🔌 Connected to Socket.IO server');
      this.isConnected = true;
      
      // Login user to Socket.IO
      this.socket.emit('user_login', {
        userId: userData.id,
        username: userData.username
      });
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Disconnected from Socket.IO server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Handle online users list
    this.socket.on('online_users', (users) => {
      this.onlineUsers = users;
      console.log('👥 Online users:', users);
      this.notifyHandlers('online_users', users);
    });

    // Handle user coming online
    this.socket.on('user_online', (user) => {
      console.log('👤 User came online:', user);
      this.onlineUsers.push(user);
      this.notifyHandlers('user_online', user);
    });

    // Handle user going offline
    this.socket.on('user_offline', (user) => {
      console.log('👋 User went offline:', user);
      this.onlineUsers = this.onlineUsers.filter(u => u.userId !== user.userId);
      this.notifyHandlers('user_offline', user);
    });

    // Handle receiving messages
    this.socket.on('receive_message', (message) => {
      console.log('💬 Received message:', message);
      this.notifyHandlers('receive_message', message);
    });

    // Handle message sent confirmation
    this.socket.on('message_sent', (message) => {
      console.log('✅ Message sent:', message);
      this.notifyHandlers('message_sent', message);
    });

    // Handle message errors
    this.socket.on('message_error', (error) => {
      console.error('❌ Message error:', error);
      this.notifyHandlers('message_error', error);
    });

    // Handle typing indicators
    this.socket.on('user_typing', (data) => {
      console.log('⌨️ User typing:', data);
      this.notifyHandlers('user_typing', data);
    });

    // Handle message read status
    this.socket.on('message_read', (data) => {
      console.log('👁️ Message read:', data);
      this.notifyHandlers('message_read', data);
    });

    // Handle message reactions
    this.socket.on('message_reaction', (data) => {
      console.log('😀 Message reaction:', data);
      this.notifyHandlers('message_reaction', data);
    });

    // Handle conversation updates
    this.socket.on('conversation_update', (data) => {
      console.log('💬 Conversation update:', data);
      this.notifyHandlers('conversation_update', data);
    });

    // Handle user status updates
    this.socket.on('user_status_update', (data) => {
      console.log('📊 User status update:', data);
      this.notifyHandlers('user_status_update', data);
    });

    // Handle errors
    this.socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
      this.notifyHandlers('error', error);
    });
  }

  // Disconnect from Socket.IO server
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.currentUser = null;
      this.onlineUsers = [];
    }
  }

  // Send a message
  sendMessage(messageData) {
    if (!this.socket || !this.isConnected) {
      console.error('Socket not connected');
      return false;
    }

    this.socket.emit('send_message', messageData);
    return true;
  }

  // Start typing indicator
  startTyping(receiverId, conversationId) {
    if (!this.socket || !this.isConnected) return;

    this.socket.emit('typing_start', {
      receiverId,
      senderId: this.currentUser.id,
      conversationId
    });
  }

  // Stop typing indicator
  stopTyping(receiverId, conversationId) {
    if (!this.socket || !this.isConnected) return;

    this.socket.emit('typing_stop', {
      receiverId,
      senderId: this.currentUser.id,
      conversationId
    });
  }

  // Mark message as read
  markMessageRead(messageId) {
    if (!this.socket || !this.isConnected) return;

    this.socket.emit('mark_message_read', {
      messageId,
      userId: this.currentUser.id
    });
  }

  // Add reaction to message
  addReaction(messageId, reaction) {
    if (!this.socket || !this.isConnected) return;

    this.socket.emit('add_reaction', {
      messageId,
      userId: this.currentUser.id,
      reaction
    });
  }

  // Forward message
  forwardMessage(originalMessageId, forwardToUsers) {
    if (!this.socket || !this.isConnected) return;

    this.socket.emit('forward_message', {
      originalMessageId,
      forwardToUsers,
      senderId: this.currentUser.id
    });
  }

  // Update user status
  updateStatus(status) {
    if (!this.socket || !this.isConnected) return;

    this.socket.emit('update_status', { status });
  }

  // Register event handlers
  on(event, handler) {
    if (!this.messageHandlers.has(event)) {
      this.messageHandlers.set(event, []);
    }
    this.messageHandlers.get(event).push(handler);
  }

  // Remove event handlers
  off(event, handler) {
    if (this.messageHandlers.has(event)) {
      const handlers = this.messageHandlers.get(event);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  // Notify all handlers for an event
  notifyHandlers(event, data) {
    if (this.messageHandlers.has(event)) {
      this.messageHandlers.get(event).forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in ${event} handler:`, error);
        }
      });
    }
  }

  // Get online users
  getOnlineUsers() {
    return this.onlineUsers;
  }

  // Check if user is online
  isUserOnline(userId) {
    return this.onlineUsers.some(user => user.userId === userId);
  }

  // Get connection status
  getConnectionStatus() {
    return this.isConnected;
  }
}

// Create singleton instance
const socketService = new SocketService();
export default socketService;
