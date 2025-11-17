/**
 * Multer Upload Middleware
 * Handles multipart file uploads for PDF and DOCX files
 */

import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { isValidFileType } from '../utils/documentLoader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../uploads');
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Generate unique filename with timestamp and session ID
        const sessionId = req.session.ragSessionId || 'unknown';
        const timestamp = Date.now();
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `${sessionId}_${timestamp}_${safeName}`;
        cb(null, filename);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    if (isValidFileType(file.originalname)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF and DOCX files are allowed.'), false);
    }
};

// Multer configuration
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB default
        files: parseInt(process.env.MAX_FILES) || 5
    }
});

export default upload;
