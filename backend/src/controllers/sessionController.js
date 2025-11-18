/**
 * Session Controller
 * Manages session lifecycle
 */

import sessionService from '../services/sessionService.js';

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
            // Create new session
            const newSessionId = sessionService.createSession();
            req.session.ragSessionId = newSessionId;
            
            // Send new session ID to client
            res.setHeader('X-Session-Id', newSessionId);

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
 * Cleanup session files on browser close
 */
export function cleanupSession(req, res, next) {
    try {
        const { sessionId } = req.body;
        
        if (!sessionId) {
            return res.status(200).json({
                success: true,
                message: 'No session to cleanup'
            });
        }

        const session = sessionService.getSession(sessionId);
        if (!session) {
            return res.status(200).json({
                success: true,
                message: 'Session not found or already cleaned'
            });
        }

        // Clear the session (this will also delete files)
        sessionService.clearSession(sessionId);

        res.status(200).json({
            success: true,
            message: 'Session cleaned up successfully'
        });
    } catch (error) {
        console.error('Error cleaning up session:', error);
        // Don't call next(error) as this is called during page unload
        res.status(200).json({
            success: true,
            message: 'Cleanup completed with errors'
        });
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
