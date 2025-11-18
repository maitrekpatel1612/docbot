/**
 * Session Routes
 */

import express from 'express';
import { getSessionInfo, clearSession, healthCheck, cleanupSession } from '../controllers/sessionController.js';

const router = express.Router();

// GET /api/session - Get session information
router.get('/', getSessionInfo);

// DELETE /api/session - Clear session
router.delete('/', clearSession);

// POST /api/session/cleanup - Cleanup session files on browser close
router.post('/cleanup', cleanupSession);

// GET /api/health - Health check
router.get('/health', healthCheck);

export default router;
