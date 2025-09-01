const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// Health check route
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'messaging-routes',
    timestamp: new Date().toISOString()
  });
});

// Get messages for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const messages = await Message.find({
      $or: [
        { 'sender.user_id': parseInt(userId) },
        { 'recipient.user_id': parseInt(userId) }
      ]
    })
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(limit);

    res.json({
      success: true,
      messages,
      pagination: {
        page,
        limit,
        total: await Message.countDocuments({
          $or: [
            { 'sender.user_id': parseInt(userId) },
            { 'recipient.user_id': parseInt(userId) }
          ]
        })
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch messages' 
    });
  }
});

// Send a new message
router.post('/send', async (req, res) => {
  try {
    const {
      sender_id,
      sender_type,
      sender_name,
      recipient_id,
      recipient_type,
      recipient_name,
      content,
      message_type = 'text'
    } = req.body;

    // Validation
    if (!sender_id || !recipient_id || !content) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: sender_id, recipient_id, content'
      });
    }

    const message = new Message({
      sender: {
        user_id: parseInt(sender_id),
        user_type: sender_type || 'customer',
        name: sender_name || 'Unknown User'
      },
      recipient: {
        user_id: parseInt(recipient_id),
        user_type: recipient_type || 'vendor',
        name: recipient_name || 'Unknown User'
      },
      content,
      message_type,
      status: 'sent'
    });

    await message.save();

    // Emit real-time event if socket.io is available
    if (req.io) {
      req.io.emit('new_message', message);
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message'
    });
  }
});

// Get conversation between two users
router.get('/conversation/:user1/:user2', async (req, res) => {
  try {
    const { user1, user2 } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({
      $or: [
        { 'sender.user_id': parseInt(user1), 'recipient.user_id': parseInt(user2) },
        { 'sender.user_id': parseInt(user2), 'recipient.user_id': parseInt(user1) }
      ]
    })
    .sort({ created_at: 1 }) // Ascending for conversation view
    .skip(skip)
    .limit(limit);

    res.json({
      success: true,
      messages,
      pagination: {
        page,
        limit,
        total: await Message.countDocuments({
          $or: [
            { 'sender.user_id': parseInt(user1), 'recipient.user_id': parseInt(user2) },
            { 'sender.user_id': parseInt(user2), 'recipient.user_id': parseInt(user1) }
          ]
        })
      }
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversation'
    });
  }
});

module.exports = router;
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'messaging-service' 
  });
});

module.exports = router;
