/**
 * useSession Hook
 * Manages session lifecycle and cleanup on page refresh
 */

import { useEffect } from 'react';
import { clearSession } from '../services/api';

export function useSession() {
    useEffect(() => {
        const handleBeforeUnload = () => {
            // Use sendBeacon for reliable request on page unload
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            navigator.sendBeacon(`${apiUrl}/api/session`, JSON.stringify({ clear: true }));
        };

        // Listen for page unload/refresh
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    const clearCurrentSession = async () => {
        try {
            await clearSession();
            window.location.reload();
        } catch (error) {
            console.error('Error clearing session:', error);
        }
    };

    return { clearCurrentSession };
}
