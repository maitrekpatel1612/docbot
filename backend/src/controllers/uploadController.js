/**
 * Upload Controller
 * Handles file upload requests
 */

import ragService from '../services/ragService.js';
import sessionService from '../services/sessionService.js';

/**
 * Handle file uploads
 */
export async function uploadFiles(req, res, next) {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No files uploaded'
            });
        }

        const sessionId = req.session.ragSessionId;
        const filePaths = req.files.map(file => file.path);
        const fileNames = req.files.map(file => file.originalname);

        console.log(`Uploading ${filePaths.length} files for session ${sessionId}`);

        // Process documents and create vector store
        const result = await ragService.processDocuments(sessionId, filePaths);

        console.log('Upload successful:', result);

        res.json({
            success: true,
            message: `Successfully processed ${result.fileCount} files`,
            data: {
                fileCount: result.fileCount,
                documentCount: result.documentCount,
                files: fileNames
            }
        });
    } catch (error) {
        console.error('Upload error:', error.message);
        console.error('Stack:', error.stack);
        next(error);
    }
}
