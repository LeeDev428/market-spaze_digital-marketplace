const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const MessageController = require('../controllers/MessageController');
const authMiddleware = require('../middleware/auth');

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = process.env.ALLOWED_FILE_TYPES.split(',');
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE)
  }
});

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Conversation routes
router.get('/conversations', MessageController.getConversations);
router.post('/conversations', MessageController.createConversation);

// Message routes
router.get('/conversations/:conversationId/messages', MessageController.getMessages);
router.post('/conversations/:conversationId/messages', MessageController.sendMessage);

// File upload
router.post('/upload', upload.single('file'), MessageController.uploadFile);

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'messaging-service' 
  });
});

module.exports = router;
