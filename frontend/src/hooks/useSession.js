/**
 * useSession Hook
 * Manages session lifecycle with localStorage persistence
 */

import { clearSession } from '../services/api';

export function useSession() {
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
