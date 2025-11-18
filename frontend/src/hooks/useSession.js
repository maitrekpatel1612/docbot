/**
 * useSession Hook
 * Manages session lifecycle with localStorage persistence
 */

import { useEffect } from 'react';
import { clearSession } from '../services/api';

export function useSession() {
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            // Check if this is a browser close (not just a refresh or navigation)
            // We detect browser close by checking if sessionStorage is being cleared
            const sessionId = localStorage.getItem('ragSessionId');
            if (sessionId) {
                // Use sendBeacon for reliable request on page unload
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const data = JSON.stringify({ sessionId });
                navigator.sendBeacon(`${apiUrl}/api/session/cleanup`, data);
            }
        };

        // Listen for page unload (browser close)
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    const clearCurrentSession = async () => {
        try {
            // Clear session from backend and localStorage
            await clearSession();
            localStorage.removeItem('ragSessionId');
            window.location.reload();
        } catch (error) {
            console.error('Error clearing session:', error);
            throw error;
        }
    };

    return { clearCurrentSession };
}
