const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    user_id: {
      type: Number, // Laravel user ID
      required: true
    },
    user_type: {
      type: String,
      enum: ['customer', 'vendor', 'rider', 'admin'],
      required: true
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    avatar: String,
    last_seen: {
      type: Date,
      default: Date.now
    }
  }],
  
  conversation_type: {
    type: String,
    enum: ['direct', 'group', 'support'],
    default: 'direct'
  },
  
  title: String, // For group conversations
  
  appointment_id: Number, // Link to Laravel appointment
  
  last_message: {
    content: String,
    sender_id: Number,
    timestamp: Date,
    message_type: {
      type: String,
      enum: ['text', 'image', 'file', 'location', 'system'],
      default: 'text'
    }
  },
  
  unread_counts: [{
    user_id: Number,
    count: {
      type: Number,
      default: 0
    }
  }],
  
  is_active: {
    type: Boolean,
    default: true
  },
  
  metadata: {
    created_by: Number,
    archived_by: [Number],
    blocked_by: [Number]
  }
}, {
  timestamps: true
});

// Indexes for performance
conversationSchema.index({ 'participants.user_id': 1 });
conversationSchema.index({ appointment_id: 1 });
conversationSchema.index({ 'last_message.timestamp': -1 });
conversationSchema.index({ conversation_type: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);
