/**
 * useChat Hook
 * Manages chat state and interactions
 */

import { useState, useCallback } from 'react';
import { sendChatMessage, getChatHistory } from '../services/api';

export function useChat() {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const sendMessage = useCallback(async (question) => {
        if (!question.trim()) return;

        setIsLoading(true);
        setError(null);

        // Add user message immediately
        const userMessage = {
            role: 'user',
            content: question,
            timestamp: Date.now()
        };
        setMessages(prev => [...prev, userMessage]);

        try {
            const response = await sendChatMessage(question);
            
            // Validate response
            if (!response?.data?.answer) {
                throw new Error('Invalid response from server');
            }
            
            // Add assistant message
            const assistantMessage = {
                role: 'assistant',
                content: response.data.answer,
                timestamp: response.data.timestamp || Date.now()
            };
            setMessages(prev => [...prev, assistantMessage]);
        } catch (err) {
            console.error('Chat error:', err);
            
            const errorMessage = err.response?.data?.error 
                || err.message 
                || 'Failed to send message. Please try again.';
            setError(errorMessage);
            
            // Remove the user message if request failed
            setMessages(prev => prev.slice(0, -1));
        } finally {
            setIsLoading(false);
        }
    }, []);

    const loadHistory = useCallback(async () => {
        try {
            const response = await getChatHistory();
            setMessages(response.data.history);
        } catch (err) {
            console.error('Failed to load chat history:', err);
        }
    }, []);

    const clearMessages = useCallback(() => {
        setMessages([]);
        setError(null);
    }, []);

    return {
        messages,
        isLoading,
        error,
        sendMessage,
        loadHistory,
        clearMessages
    };
}
