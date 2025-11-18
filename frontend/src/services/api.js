/**
 * API Service
 * Handles all API calls to the backend
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add interceptor to include session ID from localStorage
api.interceptors.request.use((config) => {
    const sessionId = localStorage.getItem('ragSessionId');
    if (sessionId) {
        config.headers['X-Session-Id'] = sessionId;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Add interceptor to store session ID from response
api.interceptors.response.use((response) => {
    const sessionId = response.headers['x-session-id'];
    if (sessionId) {
        localStorage.setItem('ragSessionId', sessionId);
    }
    return response;
}, (error) => {
    return Promise.reject(error);
});

/**
 * Upload files
 * @param {FileList|File[]} files - Files to upload
 * @param {Object} options - Additional axios options
 * @returns {Promise} Upload response
 */
export const uploadFiles = async (files, options = {}) => {
    const formData = new FormData();
    
    Array.from(files).forEach(file => {
        formData.append('files', file);
    });

    const { headers: extraHeaders, onUploadProgress, ...restOptions } = options;

    const response = await api.post('/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            ...(extraHeaders || {})
        },
        onUploadProgress: onUploadProgress,
        ...restOptions
    });

    return response.data;
};

/**
 * Send chat message
 * @param {string} question - User question
 * @returns {Promise} Chat response
 */
export const sendChatMessage = async (question) => {
    const response = await api.post('/chat', { question });
    return response.data;
};

/**
 * Get chat history
 * @returns {Promise} Chat history
 */
export const getChatHistory = async () => {
    const response = await api.get('/chat/history');
    return response.data;
};

/**
 * Get session info
 * @returns {Promise} Session information
 */
export const getSessionInfo = async () => {
    const response = await api.get('/session');
    return response.data;
};

/**
 * Clear session
 * @returns {Promise} Clear session response
 */
export const clearSession = async () => {
    const response = await api.delete('/session');
    return response.data;
};

/**
 * Health check
 * @returns {Promise} Health check response
 */
export const healthCheck = async () => {
    const response = await api.get('/session/health');
    return response.data;
};

export default api;
