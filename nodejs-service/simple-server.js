const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
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

// Simple Message Schema
const messageSchema = new mongoose.Schema({
  sender_id: Number,
  sender_name: String,
  recipient_id: Number, 
  recipient_name: String,
  content: String,
  created_at: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Simple messaging service working!' });
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
          user_type: 'customer',
          name: msg.sender_name
        },
        recipient: {
          user_id: msg.recipient_id, 
          user_type: 'vendor',
          name: msg.recipient_name
        },
        content: msg.content,
        message_type: 'text',
        status: 'sent',
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

app.listen(PORT, '127.0.0.1', () => {
  console.log(`🚀 Simple messaging service running on port ${PORT}`);
  console.log(`📍 Server bound to 127.0.0.1:${PORT}`);
  console.log(`⚡ Health check: http://127.0.0.1:${PORT}/health`);
});
