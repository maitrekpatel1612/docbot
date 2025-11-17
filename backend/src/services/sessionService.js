/**
 * Session Service
 * Manages session data, vector stores, and TTL-based cleanup
 */

import { v4 as uuidv4 } from 'uuid';

class SessionService {
    constructor() {
        this.sessions = new Map(); // sessionId -> session data
        this.cleanupInterval = null;
        this.sessionTTL = parseInt(process.env.SESSION_TTL) || 1800000; // 30 minutes default
    }

    /**
     * Create a new session
     * @returns {string} Session ID
     */
    createSession() {
        const sessionId = uuidv4();
        this.sessions.set(sessionId, {
            sessionId,
            vectorStore: null,
            chatHistory: [],
            uploadedFiles: [],
            lastActivity: Date.now(),
            createdAt: Date.now()
        });
        
        console.log(`Created session: ${sessionId}`);
        return sessionId;
    }

    /**
     * Get session data
     * @param {string} sessionId - Session ID
     * @returns {Object|null} Session data or null if not found
     */
    getSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.lastActivity = Date.now(); // Update last activity
        }
        return session || null;
    }

    /**
     * Update session data
     * @param {string} sessionId - Session ID
     * @param {Object} updates - Updates to apply
     */
    updateSession(sessionId, updates) {
        const session = this.getSession(sessionId);
        if (session) {
            Object.assign(session, updates, { lastActivity: Date.now() });
            this.sessions.set(sessionId, session);
        }
    }

    /**
     * Add message to chat history
     * @param {string} sessionId - Session ID
     * @param {string} role - 'user' or 'assistant'
     * @param {string} content - Message content
     */
    addChatMessage(sessionId, role, content) {
        const session = this.getSession(sessionId);
        if (session) {
            session.chatHistory.push({
                role,
                content,
                timestamp: Date.now()
            });
            this.updateSession(sessionId, session);
        }
    }

    /**
     * Clear session data
     * @param {string} sessionId - Session ID
     * @returns {boolean} True if session was cleared
     */
    clearSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (session) {
            // Clear vector store if exists
            if (session.vectorStore) {
                session.vectorStore = null;
            }
            
            // Return uploaded files for cleanup
            const uploadedFiles = session.uploadedFiles || [];
            
            this.sessions.delete(sessionId);
            console.log(`Cleared session: ${sessionId}`);
            return { cleared: true, uploadedFiles };
        }
        return { cleared: false, uploadedFiles: [] };
    }

    /**
     * Start automatic cleanup of inactive sessions
     */
    startCleanupService() {
        if (this.cleanupInterval) {
            return; // Already running
        }

        console.log(`Starting session cleanup service (TTL: ${this.sessionTTL}ms)`);
        
        this.cleanupInterval = setInterval(() => {
            const now = Date.now();
            let cleanedCount = 0;

            for (const [sessionId, session] of this.sessions.entries()) {
                if (now - session.lastActivity > this.sessionTTL) {
                    this.clearSession(sessionId);
                    cleanedCount++;
                }
            }

            if (cleanedCount > 0) {
                console.log(`Cleaned up ${cleanedCount} inactive sessions`);
            }
        }, 300000); // Run every 5 minutes
    }

    /**
     * Stop cleanup service
     */
    stopCleanupService() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
            console.log('Stopped session cleanup service');
        }
    }

    /**
     * Get session count
     * @returns {number} Number of active sessions
     */
    getSessionCount() {
        return this.sessions.size;
    }

    /**
     * Get all session IDs
     * @returns {Array<string>} Array of session IDs
     */
    getAllSessionIds() {
        return Array.from(this.sessions.keys());
    }
}

// Export singleton instance
export default new SessionService();
