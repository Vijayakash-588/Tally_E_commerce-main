import api from './axios';

/**
 * Send a message to the AI chatbot.
 * @param {string} message 
 * @returns {Promise<{reply: string, confidence?: number, evidence?: any[], warnings?: string[], actionSuggestions?: any[]}>}
 */
export const sendChatMessage = async (message) => {
    try {
        const response = await api.post('/ai/chat', { message });
        return {
            reply: response.data?.reply || response.data?.message || 'No response from AI',
            confidence: response.data?.confidence,
            evidence: response.data?.evidence || [],
            warnings: response.data?.warnings || [],
            actionSuggestions: response.data?.actionSuggestions || [],
            mode: response.data?.mode || 'legacy',
            nlp: response.data?.nlp || null
        };
    } catch (error) {
        const serverMessage = error?.response?.data?.message;
        const detail = error?.response?.data?.error;
        const message = serverMessage || detail || 'Failed to connect to AI endpoint';
        throw new Error(message);
    }
};
