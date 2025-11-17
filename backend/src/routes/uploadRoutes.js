/**
 * Upload Routes
 */

import express from 'express';
import upload from '../middleware/uploadMiddleware.js';
import { uploadFiles } from '../controllers/uploadController.js';

const router = express.Router();

// POST /api/upload - Upload files
router.post('/', upload.array('files', parseInt(process.env.MAX_FILES) || 5), uploadFiles);

export default router;
