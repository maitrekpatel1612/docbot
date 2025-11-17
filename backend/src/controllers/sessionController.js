/**
 * Session Controller
 * Manages session lifecycle
 */

import sessionService from '../services/sessionService.js';
import fs from 'fs';
import path from 'path';

/**
 * Get session information
 */
export function getSessionInfo(req, res, next) {
    try {
        const sessionId = req.session.ragSessionId;
        const session = sessionService.getSession(sessionId);

        if (!session) {
            return res.status(404).json({
                success: false,
                error: 'Session not found'
            });
        }

        res.json({
            success: true,
            data: {
                sessionId: session.sessionId,
                hasDocuments: session.vectorStore !== null,
                uploadedFiles: session.uploadedFiles,
                chatHistoryCount: session.chatHistory.length,
                createdAt: session.createdAt,
                lastActivity: session.lastActivity
            }
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Clear session data
 */
export function clearSession(req, res, next) {
    try {
        const sessionId = req.session.ragSessionId;
        const result = sessionService.clearSession(sessionId);

        if (result.cleared) {
            // Delete uploaded files
            if (result.uploadedFiles && result.uploadedFiles.length > 0) {
                const uploadDir = path.join(process.cwd(), 'uploads');
                
                result.uploadedFiles.forEach(filePath => {
                    try {
                        // Check if it's a full path or just filename
                        const fullPath = path.isAbsolute(filePath) 
                            ? filePath 
                            : path.join(uploadDir, filePath);
                        
                        if (fs.existsSync(fullPath)) {
                            fs.unlinkSync(fullPath);
                            console.log(`Deleted file: ${fullPath}`);
                        }
                    } catch (err) {
                        console.error(`Error deleting file ${filePath}:`, err);
                    }
                });
            }
            
            // Create new session
            const newSessionId = sessionService.createSession();
            req.session.ragSessionId = newSessionId;

            res.json({
                success: true,
                message: 'Session cleared successfully',
                data: {
                    newSessionId
                }
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'Session not found'
            });
        }
    } catch (error) {
        next(error);
    }
}

/**
 * Health check
 */
export function healthCheck(req, res) {
    res.json({
        success: true,
        message: 'RAG Chatbot API is running',
        data: {
            activeSessions: sessionService.getSessionCount(),
            timestamp: Date.now()
        }
    });
}
