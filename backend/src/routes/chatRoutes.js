/**
 * Chat Routes
 */

import express from 'express';
import { sendMessage, getChatHistory } from '../controllers/chatController.js';

const router = express.Router();

// POST /api/chat - Send a chat message
router.post('/', sendMessage);

// GET /api/chat/history - Get chat history
router.get('/history', getChatHistory);

export default router;
