import api from './axios';

/**
 * Send a message to the AI chatbot.
 * @param {string} message 
 * @returns {Promise<string>} The response from the AI.
 */
export const sendChatMessage = async (message) => {
    const response = await api.post('/ai/chat', { message });
    return response.data?.reply || response.data?.message || 'No response from AI';
};
