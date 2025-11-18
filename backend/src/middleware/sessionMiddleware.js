/**
 * Session Middleware
 * Initializes session if not exists
 */

import sessionService from '../services/sessionService.js';

export function initializeSession(req, res, next) {
    let sessionId = null;
    
    // Check for session ID in custom header (from localStorage)
    const headerSessionId = req.headers['x-session-id'];
    if (headerSessionId) {
        const session = sessionService.getSession(headerSessionId);
        if (session) {
            sessionId = headerSessionId;
            req.session.ragSessionId = sessionId;
        }
    }
    
    // If no valid session found, check express-session
    if (!sessionId && req.session.ragSessionId) {
        const session = sessionService.getSession(req.session.ragSessionId);
        if (session) {
            sessionId = req.session.ragSessionId;
        }
    }
    
    // Only create new session if none exists
    if (!sessionId) {
        sessionId = sessionService.createSession();
        req.session.ragSessionId = sessionId;
    }
    
    // Always send session ID back to client
    res.setHeader('X-Session-Id', sessionId);
    
    next();
}
