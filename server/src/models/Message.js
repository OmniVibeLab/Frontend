import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'forwarded', 'reply'],
    default: 'text'
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  conversationId: {
    type: String,
    required: true
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  originalMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  reactions: {
    type: Map,
    of: String,
    default: new Map()
  },
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'file', 'audio', 'video']
    },
    url: String,
    filename: String,
    size: Number,
    mimeType: String
  }],
  edited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  deleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  }
}, { timestamps: true });

// Create conversation ID from sorted user IDs
messageSchema.pre('save', function(next) {
  if (!this.conversationId) {
    const ids = [this.sender.toString(), this.receiver.toString()].sort();
    this.conversationId = `${ids[0]}_${ids[1]}`;
  }
  next();
});

// Virtual for reaction count
messageSchema.virtual('reactionCount').get(function() {
  return this.reactions ? this.reactions.size : 0;
});

// Virtual for formatted timestamp
messageSchema.virtual('formattedTime').get(function() {
  return this.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
});

// Indexes for better performance
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ status: 1 });
messageSchema.index({ createdAt: -1 });

// Ensure virtual fields are serialized
messageSchema.set('toJSON', { virtuals: true });

export default mongoose.model("Message", messageSchema);
