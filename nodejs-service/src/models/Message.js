const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversation_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  
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
  
  content: {
    type: String,
    required: true
  },
  
  message_type: {
    type: String,
    enum: ['text', 'image', 'file', 'location', 'system'],
    default: 'text'
  },
  
  attachments: [{
    file_name: String,
    file_path: String,
    file_size: Number,
    file_type: String,
    thumbnail_path: String
  }],
  
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  
  reply_to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  
  read_by: [{
    user_id: Number,
    read_at: {
      type: Date,
      default: Date.now
    }
  }],
  
  reactions: [{
    user_id: Number,
    emoji: String,
    created_at: {
      type: Date,
      default: Date.now
    }
  }],
  
  edited: {
    is_edited: {
      type: Boolean,
      default: false
    },
    edited_at: Date,
    original_content: String
  },
  
  deleted: {
    is_deleted: {
      type: Boolean,
      default: false
    },
    deleted_at: Date,
    deleted_by: Number
  }
}, {
  timestamps: true
});

// Indexes for performance
messageSchema.index({ conversation_id: 1, createdAt: -1 });
messageSchema.index({ 'sender.user_id': 1 });
messageSchema.index({ status: 1 });
messageSchema.index({ message_type: 1 });

module.exports = mongoose.model('Message', messageSchema);
