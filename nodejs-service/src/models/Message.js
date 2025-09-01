const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
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
    avatar: String
  },
  
  recipient: {
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
    avatar: String
  },
  
  content: {
    type: String,
    required: true,
    maxLength: 1000
  },
  
  message_type: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text'
  },
  
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  
  read_at: {
    type: Date,
    default: null
  },
  
  created_at: {
    type: Date,
    default: Date.now
  },
  
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
messageSchema.index({ 'sender.user_id': 1, 'recipient.user_id': 1, created_at: -1 });
messageSchema.index({ created_at: -1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
