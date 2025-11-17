/**
 * Chat Controller
 * Handles chat requests and interactions with RAG system
 */

import ragService from '../services/ragService.js';

/**
 * Handle chat message
 */
export async function sendMessage(req, res, next) {
    try {
        const { question } = req.body;

        if (!question || typeof question !== 'string' || question.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Question is required'
            });
        }

        const sessionId = req.session.ragSessionId;

        console.log(`Chat request from session ${sessionId}: ${question}`);

        // Get response from RAG system
        const answer = await ragService.chat(sessionId, question);

        res.json({
            success: true,
            data: {
                question,
                answer,
                timestamp: Date.now()
            }
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Get chat history
 */
export async function getChatHistory(req, res, next) {
    try {
        const sessionId = req.session.ragSessionId;
        const history = ragService.getChatHistory(sessionId);

        res.json({
            success: true,
            data: {
                history,
                count: history.length
            }
        });
    } catch (error) {
        next(error);
    }
}
