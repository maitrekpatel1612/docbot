/**
 * Upload Routes
 */

import express from 'express';
import upload from '../middleware/uploadMiddleware.js';
import { uploadFiles } from '../controllers/uploadController.js';

const router = express.Router();

// POST /api/upload - Upload files
router.post('/', (req, res, next) => {
    const uploadHandler = upload.array('files', parseInt(process.env.MAX_FILES) || 5);
    
    uploadHandler(req, res, (err) => {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    error: 'File size exceeds the limit of 10MB'
                });
            }
            if (err.code === 'LIMIT_FILE_COUNT') {
                return res.status(400).json({
                    success: false,
                    error: `Maximum ${process.env.MAX_FILES || 5} files allowed`
                });
            }
            if (err.message.includes('Invalid file type')) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid file type. Only PDF and DOCX files are allowed.'
                });
            }
            return res.status(400).json({
                success: false,
                error: err.message || 'File upload failed'
            });
        }
        next();
    });
}, uploadFiles);

export default router;
