/**
 * Session Routes
 */

import express from 'express';
import { getSessionInfo, clearSession, healthCheck } from '../controllers/sessionController.js';

const router = express.Router();

// GET /api/session - Get session information
router.get('/', getSessionInfo);

// DELETE /api/session - Clear session
router.delete('/', clearSession);

// GET /api/health - Health check
router.get('/health', healthCheck);

export default router;
