const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:8000", "http://localhost:5173", "http://127.0.0.1:8000"],
    methods: ["GET", "POST"],
    credentials: true
  }
});
const PORT = 3003;

// Middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.use(cors({
  origin: ["http://localhost:8000", "http://localhost:5173", "http://127.0.0.1:8000"],
  credentials: true
}));

// Custom JSON parser that handles errors better
app.use((req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    let body = '';
    req.setEncoding('utf8');
    
    req.on('data', function(chunk) {
      body += chunk;
    });
    
    req.on('end', function() {
      console.log('Raw body received:', JSON.stringify(body));
      
      if (body) {
        try {
          req.body = JSON.parse(body);
          console.log('Successfully parsed JSON:', req.body);
        } catch (error) {
          console.error('JSON Parse Error:', error.message);
          console.error('Raw body that failed:', body);
          console.error('First few characters:', body.substring(0, 10));
          
          return res.status(400).json({
            success: false,
            error: 'Invalid JSON format',
            details: error.message,
            receivedData: body.substring(0, 100) + (body.length > 100 ? '...' : '')
          });
        }
      } else {
        req.body = {};
      }
      next();
    });
  } else {
    next();
  }
});

// MongoDB connection
mongoose.connect('mongodb+srv://grafrafraftorres28:y33CwzAkoHffENbQ@cluster0.0c5qorv.mongodb.net/market_spaze_messaging?retryWrites=true&w=majority&appName=Cluster0')
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.log('❌ MongoDB error:', err));

// Enhanced Message Schema
const messageSchema = new mongoose.Schema({
  sender_id: Number,
  sender_name: String,
  sender_type: { type: String, default: 'customer' },
  recipient_id: Number, 
  recipient_name: String,
  recipient_type: { type: String, default: 'vendor' },
  content: String,
  message_type: { type: String, default: 'text' },
  status: { type: String, default: 'sent' },
  is_read: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

// Function to update and emit unread count
async function updateUnreadCount(userId) {
  try {
    const unreadCount = await Message.countDocuments({
      recipient_id: userId,
      is_read: false
    });
    
    // Emit to the specific user
    io.to(`user_${userId}`).emit('unread_count_update', { unreadCount });
    console.log(`📊 Updated unread count for user ${userId}: ${unreadCount}`);
  } catch (error) {
    console.error('❌ Error updating unread count:', error);
  }
}

// Socket.IO connection handling
const connectedUsers = new Map();
const userActivity = new Map(); // Track last activity time

io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);
  
  // User joins with their ID and type
  socket.on('join', (userData) => {
    const { userId, userType, userName } = userData;
    socket.userId = userId;
    socket.userType = userType;
    socket.userName = userName;
    
    const now = Date.now();
    connectedUsers.set(userId, {
      socketId: socket.id,
      userType,
      userName,
      online: true,
      lastActivity: now
    });
    
    userActivity.set(userId, now);
    
    socket.join(`user_${userId}`);
    console.log(`👤 User ${userName} (${userType}) joined room: user_${userId}`);
    
    // Send current online users to the new user
    const onlineUserIds = Array.from(connectedUsers.keys());
    socket.emit('online_users', onlineUserIds);
    
    // Broadcast user online status
    socket.broadcast.emit('user_online', { userId, userType, userName });
  });

  // Handle user activity updates
  socket.on('user_activity', (data) => {
    const { userId, timestamp } = data;
    if (connectedUsers.has(userId)) {
      const user = connectedUsers.get(userId);
      user.lastActivity = timestamp;
      connectedUsers.set(userId, user);
      userActivity.set(userId, timestamp);
    }
  });
  
  // Handle real-time message sending
  socket.on('send_message', async (messageData) => {
    try {
      const message = new Message({
        sender_id: messageData.sender_id,
        sender_name: messageData.sender_name,
        sender_type: messageData.sender_type || 'customer',
        recipient_id: messageData.recipient_id,
        recipient_name: messageData.recipient_name,
        recipient_type: messageData.recipient_type || 'vendor',
        content: messageData.content,
        message_type: messageData.message_type || 'text'
      });
      
      await message.save();
      
      const formattedMessage = {
        _id: message._id,
        sender: {
          user_id: message.sender_id,
          user_type: message.sender_type,
          name: message.sender_name
        },
        recipient: {
          user_id: message.recipient_id,
          user_type: message.recipient_type,
          name: message.recipient_name
        },
        content: message.content,
        message_type: message.message_type,
        status: message.status,
        is_read: message.is_read,
        created_at: message.created_at
      };
      
      // Send to recipient if online
      socket.to(`user_${messageData.recipient_id}`).emit('new_message', formattedMessage);
      
      // Send confirmation back to sender
      socket.emit('message_sent', formattedMessage);
      
      // Update unread count for recipient
      await updateUnreadCount(messageData.recipient_id);
      
      console.log(`💬 Message sent from ${messageData.sender_name} to ${messageData.recipient_name}`);
      
    } catch (error) {
      socket.emit('message_error', { error: error.message });
      console.error('❌ Socket message error:', error);
    }
  });
  
  // Mark messages as read
  socket.on('mark_as_read', async (data) => {
    try {
      const { messageIds, userId } = data;
      await Message.updateMany(
        { _id: { $in: messageIds }, recipient_id: userId },
        { is_read: true }
      );
      
      // Notify sender that messages were read
      const messages = await Message.find({ _id: { $in: messageIds } });
      messages.forEach(msg => {
        socket.to(`user_${msg.sender_id}`).emit('messages_read', {
          messageIds: [msg._id],
          readBy: userId
        });
      });
      
      // Update unread count for the user who read the messages
      await updateUnreadCount(userId);
      
    } catch (error) {
      console.error('❌ Mark as read error:', error);
    }
  });
  
  socket.on('disconnect', () => {
    if (socket.userId) {
      connectedUsers.delete(socket.userId);
      userActivity.delete(socket.userId);
      socket.broadcast.emit('user_offline', { 
        userId: socket.userId, 
        userType: socket.userType,
        userName: socket.userName 
      });
      console.log(`👋 User ${socket.userName} disconnected`);
    }
  });
});

// Check for idle users every 30 seconds
setInterval(() => {
  const now = Date.now();
  const IDLE_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds
  
  connectedUsers.forEach((user, userId) => {
    const lastActivity = userActivity.get(userId) || 0;
    const timeSinceActivity = now - lastActivity;
    
    if (timeSinceActivity > IDLE_TIMEOUT && user.online) {
      // Mark user as offline due to inactivity
      user.online = false;
      connectedUsers.set(userId, user);
      
      // Notify all users that this user went offline
      io.emit('user_offline', { 
        userId, 
        userType: user.userType,
        userName: user.userName 
      });
      
      console.log(`⏱️ User ${user.userName} marked offline due to inactivity`);
    }
  });
}, 30000); // Check every 30 seconds

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Simple messaging service working!' });
});

// Get user's conversations with unread counts
app.get('/api/messages/conversations/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // Get all conversations for this user
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender_id: userId },
            { recipient_id: userId }
          ]
        }
      },
      {
        $addFields: {
          other_user_id: {
            $cond: [
              { $eq: ["$sender_id", userId] },
              "$recipient_id",
              "$sender_id"
            ]
          },
          other_user_name: {
            $cond: [
              { $eq: ["$sender_id", userId] },
              "$recipient_name",
              "$sender_name"
            ]
          },
          other_user_type: {
            $cond: [
              { $eq: ["$sender_id", userId] },
              "$recipient_type",
              "$sender_type"
            ]
          }
        }
      },
      {
        $group: {
          _id: "$other_user_id",
          other_user_name: { $first: "$other_user_name" },
          other_user_type: { $first: "$other_user_type" },
          last_message: { $last: "$content" },
          last_message_time: { $last: "$created_at" },
          total_messages: { $sum: 1 },
          unread_count: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ["$recipient_id", userId] },
                  { $eq: ["$is_read", false] }
                ]},
                1,
                0
              ]
            }
          }
        }
      },
      { $sort: { last_message_time: -1 } }
    ]);
    
    res.json({
      success: true,
      conversations: conversations.map(conv => ({
        user_id: conv._id,
        user_name: conv.other_user_name,
        user_type: conv.other_user_type,
        last_message: conv.last_message,
        last_message_time: conv.last_message_time,
        total_messages: conv.total_messages,
        unread_count: conv.unread_count
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get conversation between two users
app.get('/api/messages/conversation/:user1/:user2', async (req, res) => {
  try {
    const user1 = parseInt(req.params.user1);
    const user2 = parseInt(req.params.user2);
    
    const messages = await Message.find({
      $or: [
        { sender_id: user1, recipient_id: user2 },
        { sender_id: user2, recipient_id: user1 }
      ]
    }).sort({ created_at: 1 });
    
    res.json({
      success: true,
      messages: messages.map(msg => ({
        _id: msg._id,
        sender: {
          user_id: msg.sender_id,
          user_type: msg.sender_type,
          name: msg.sender_name
        },
        recipient: {
          user_id: msg.recipient_id,
          user_type: msg.recipient_type,
          name: msg.recipient_name
        },
        content: msg.content,
        message_type: msg.message_type,
        status: msg.status,
        is_read: msg.is_read,
        created_at: msg.created_at
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get total unread message count for a user
app.get('/api/messages/unread-count/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const unreadCount = await Message.countDocuments({
      recipient_id: userId,
      is_read: false
    });
    
    res.json({
      success: true,
      unread_count: unreadCount
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get total message count for a user (all conversations)
app.get('/api/messages/total-count/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const totalCount = await Message.countDocuments({
      $or: [
        { sender_id: userId },
        { recipient_id: userId }
      ]
    });
    
    res.json({
      success: true,
      total_count: totalCount
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/messages/user/:userId', async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender_id: parseInt(req.params.userId) },
        { recipient_id: parseInt(req.params.userId) }
      ]
    }).sort({ created_at: -1 });
    
    res.json({
      success: true,
      messages: messages.map(msg => ({
        _id: msg._id,
        sender: {
          user_id: msg.sender_id,
          user_type: msg.sender_type,
          name: msg.sender_name
        },
        recipient: {
          user_id: msg.recipient_id, 
          user_type: msg.recipient_type,
          name: msg.recipient_name
        },
        content: msg.content,
        message_type: msg.message_type,
        status: msg.status,
        is_read: msg.is_read,
        created_at: msg.created_at
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/messages/send', async (req, res) => {
  try {
    console.log('=== POST /api/messages/send ===');
    console.log('Raw body:', req.body);
    console.log('Body type:', typeof req.body);
    console.log('Body keys:', req.body ? Object.keys(req.body) : 'No body');
    
    // Validate required fields
    const { sender_id, sender_name, recipient_id, recipient_name, content } = req.body;
    
    if (!sender_id || !sender_name || !recipient_id || !recipient_name || !content) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['sender_id', 'sender_name', 'recipient_id', 'recipient_name', 'content'],
        received: req.body
      });
    }
    
    const message = new Message({
      sender_id,
      sender_name,
      recipient_id,
      recipient_name,
      content
    });
    
    await message.save();
    console.log('✅ Message saved to MongoDB:', message._id);
    
    res.json({
      success: true,
      message: 'Message sent successfully!',
      data: {
        _id: message._id,
        sender: {
          user_id: sender_id,
          user_type: 'customer', 
          name: sender_name
        },
        recipient: {
          user_id: recipient_id,
          user_type: 'vendor',
          name: recipient_name
        },
        content,
        message_type: 'text',
        status: 'sent',
        created_at: message.created_at
      }
    });
  } catch (error) {
    console.error('❌ Error in /api/messages/send:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`🚀 Enhanced messaging service with Socket.IO running on port ${PORT}`);
  console.log(`📍 Server bound to 127.0.0.1:${PORT}`);
  console.log(`⚡ Health check: http://127.0.0.1:${PORT}/health`);
  console.log(`🔌 Socket.IO enabled for real-time messaging`);
});
