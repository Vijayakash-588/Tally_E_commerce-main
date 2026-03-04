const aiService = require('./ai.service');

/**
 * Handle chatbot messages.
 * POST /api/ai/chat
 */
exports.chat = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        const reply = await aiService.askAI(message);

        res.json({
            success: true,
            reply
        });
    } catch (error) {
        console.error('AI Controller Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get response from AI',
            error: error.message
        });
    }
};
