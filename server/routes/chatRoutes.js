const express = require('express');
const router = express.Router();
const { chat } = require('../controllers/chatController');

// Rate limit chat more aggressively
const rateLimit = require('express-rate-limit');
const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 6, // 15 messages per minute
  message: { reply: 'Bạn gửi tin nhắn quá nhanh. Vui lòng đợi một chút rồi thử lại.' },
});

router.post('/', chatLimiter, chat);

module.exports = router;
