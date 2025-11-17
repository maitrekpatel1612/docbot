/**
 * Session Middleware
 * Initializes session if not exists
 */

import sessionService from '../services/sessionService.js';

export function initializeSession(req, res, next) {
    // Check if session ID exists in express-session
    if (!req.session.ragSessionId) {
        // Create new RAG session
        const sessionId = sessionService.createSession();
        req.session.ragSessionId = sessionId;
    } else {
        // Check if session exists in our service
        const session = sessionService.getSession(req.session.ragSessionId);
        if (!session) {
            // Session expired or cleared, create new one
            const sessionId = sessionService.createSession();
            req.session.ragSessionId = sessionId;
        }
    }
    
    next();
}
