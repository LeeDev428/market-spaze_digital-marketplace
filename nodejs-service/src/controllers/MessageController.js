const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const mongoose = require('mongoose');

class MessageController {
  // Get conversations for a user
  async getConversations(req, res) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const conversations = await Conversation.find({
        'participants.user_id': userId,
        is_active: true
      })
      .sort({ 'last_message.timestamp': -1 })
      .skip(skip)
      .limit(limit);

      res.json({
        conversations,
        pagination: {
          page,
          limit,
          total: await Conversation.countDocuments({
            'participants.user_id': userId,
            is_active: true
          })
        }
      });
    } catch (error) {
      console.error('Get conversations error:', error);
      res.status(500).json({ error: 'Failed to fetch conversations' });
    }
  }

  // Get messages in a conversation
  async getMessages(req, res) {
    try {
      const { conversationId } = req.params;
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const skip = (page - 1) * limit;

      // Check if user is participant
      const conversation = await Conversation.findOne({
        _id: conversationId,
        'participants.user_id': userId
      });

      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      const messages = await Message.find({
        conversation_id: conversationId,
        'deleted.is_deleted': false
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('reply_to');

      // Mark messages as read
      await Message.updateMany(
        {
          conversation_id: conversationId,
          'sender.user_id': { $ne: userId },
          'read_by.user_id': { $ne: userId }
        },
        {
          $push: {
            read_by: {
              user_id: userId,
              read_at: new Date()
            }
          }
        }
      );

      // Update unread count
      await Conversation.updateOne(
        {
          _id: conversationId,
          'unread_counts.user_id': userId
        },
        {
          $set: { 'unread_counts.$.count': 0 }
        }
      );

      res.json({
        messages: messages.reverse(),
        pagination: {
          page,
          limit,
          total: await Message.countDocuments({
            conversation_id: conversationId,
            'deleted.is_deleted': false
          })
        }
      });
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  }

  // Send a message
  async sendMessage(req, res) {
    try {
      const { conversationId, content, messageType = 'text', replyTo } = req.body;
      const userId = req.user.id;

      // Validate conversation
      const conversation = await Conversation.findOne({
        _id: conversationId,
        'participants.user_id': userId
      });

      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      // Create message
      const message = new Message({
        conversation_id: conversationId,
        sender: {
          user_id: userId,
          user_type: req.user.role,
          name: req.user.name,
          avatar: req.user.avatar
        },
        content,
        message_type: messageType,
        reply_to: replyTo || null
      });

      await message.save();

      // Update conversation last message
      await Conversation.updateOne(
        { _id: conversationId },
        {
          $set: {
            'last_message': {
              content,
              sender_id: userId,
              timestamp: new Date(),
              message_type: messageType
            }
          },
          $inc: {
            'unread_counts.$[elem].count': 1
          }
        },
        {
          arrayFilters: [{ 'elem.user_id': { $ne: userId } }]
        }
      );

      // Populate message for response
      await message.populate('reply_to');

      // Emit to other participants via Socket.IO
      req.io.to(`conversation_${conversationId}`).emit('new_message', {
        message,
        conversation_id: conversationId
      });

      res.status(201).json({ message });
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  }

  // Create or get conversation
  async createConversation(req, res) {
    try {
      const { participants, conversationType = 'direct', title, appointmentId } = req.body;
      const userId = req.user.id;

      // Add current user to participants if not included
      const allParticipants = participants.some(p => p.user_id === userId) 
        ? participants 
        : [...participants, {
            user_id: userId,
            user_type: req.user.role,
            name: req.user.name,
            email: req.user.email
          }];

      // Check if conversation already exists (for direct messages)
      if (conversationType === 'direct' && allParticipants.length === 2) {
        const participantIds = allParticipants.map(p => p.user_id).sort();
        const existingConversation = await Conversation.findOne({
          conversation_type: 'direct',
          'participants.user_id': { $all: participantIds }
        });

        if (existingConversation) {
          return res.json({ conversation: existingConversation });
        }
      }

      // Create new conversation
      const conversation = new Conversation({
        participants: allParticipants,
        conversation_type: conversationType,
        title,
        appointment_id: appointmentId,
        unread_counts: allParticipants.map(p => ({
          user_id: p.user_id,
          count: 0
        })),
        metadata: {
          created_by: userId
        }
      });

      await conversation.save();

      res.status(201).json({ conversation });
    } catch (error) {
      console.error('Create conversation error:', error);
      res.status(500).json({ error: 'Failed to create conversation' });
    }
  }

  // Upload file
  async uploadFile(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const fileData = {
        file_name: req.file.originalname,
        file_path: req.file.path,
        file_size: req.file.size,
        file_type: req.file.mimetype,
        url: `/uploads/${req.file.filename}`
      };

      res.json({ file: fileData });
    } catch (error) {
      console.error('Upload file error:', error);
      res.status(500).json({ error: 'Failed to upload file' });
    }
  }
}

module.exports = new MessageController();
