const aiService = require('./ai.service');
const { buildEvidence } = require('./evidence.service');
const {
    calculateConfidence,
    buildWarnings,
    buildSafeFallback,
    buildEvidenceFallback
} = require('./safety.service');
const predictionsService = require('./ai-predictions.service');
const anomalyService = require('./ai-anomaly.service');
const recommendationsService = require('./ai-recommendations.service');

const isDataQuery = (prompt = '') => {
    const lower = prompt.toLowerCase();
    return ['sales', 'inventory', 'stock', 'invoice', 'payment', 'purchase', 'customer', 'supplier', 'report', 'forecast', 'predict', 'prediction', 'estimate', 'future', 'trend', 'order', 'product'].some((term) => lower.includes(term));
};

/**
 * Handle chatbot messages.
 * POST /api/ai/chat
 */
exports.chat = async (req, res) => {
    try {
        const { message } = req.body;
        const trimmedMessage = (message || '').trim();

        if (!trimmedMessage) {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        const dataQuery = isDataQuery(trimmedMessage);

        let evidenceBundle = {
            evidence: [],
            contextSummary: '',
            actionSuggestions: [{ label: 'Open main dashboard', route: '/' }],
            dataQuery
        };

        if (dataQuery) {
            try {
                evidenceBundle = await buildEvidence(trimmedMessage);
            } catch (evidenceError) {
                console.error('Evidence build error:', evidenceError);
            }
        }

        const enhancedPrompt = [
            'You are a general-purpose AI assistant for this application, similar to ChatGPT and Copilot.',
            'Answer every user prompt directly, completely, and conversationally from the user\'s perspective.',
            'If the user asks multiple things, answer each part in order and do not skip any part.',
            'Infer the user\'s intent when the question is vague, and if the request is ambiguous ask one short clarifying question instead of giving a generic reply.',
            'When the user wants help, act like a useful assistant: explain, summarize, draft, plan, compare, or suggest next steps as needed.',
            'If the user asks for a prediction, forecast, or estimate, give a reasoned prediction with assumptions, likely outcomes, and a short confidence note when possible.',
            'When relevant, include this structure: Direct answer, key facts used, recommended actions, and optional next step.',
            'Use the application data snapshot only when the question is actually about application data.',
            'If the question is unrelated to application data, answer it from general knowledge without forcing ERP context.',
            'If application data is relevant, use exact numbers and clearly separate verified facts from general guidance.',
            'If the question needs the application to do something, describe the exact action the user should take and the result they should expect.',
            'Use bullets, sections, or code blocks when they make the answer clearer.',
            'Do not say you can only answer specific prompts or only ERP questions.',
            'Core capabilities in this app context: sales analysis, purchase analysis, inventory/stock checks, invoice/payment insights, trend/forecast guidance, and workflow recommendations.',
            '',
            `Question: ${trimmedMessage}`,
            '',
            dataQuery ? 'Application Data Snapshot:' : 'No application data context needed for this question.',
            dataQuery ? (evidenceBundle.contextSummary || '(No relevant data found)') : '',
            '',
            'Provide a practical action if relevant.'
        ].join('\n');

        let rawReply = '';
        let mode = 'explainable';
        let providerErrorMessage = '';

        try {
            rawReply = await aiService.askAI(enhancedPrompt);
        } catch (aiError) {
            console.error('AI provider error:', aiError);
            providerErrorMessage = aiError?.message || '';
            rawReply = buildEvidenceFallback({
                prompt: trimmedMessage,
                evidence: evidenceBundle.evidence,
                actionSuggestions: evidenceBundle.actionSuggestions,
                providerErrorMessage
            });
            mode = 'evidence-fallback';
        }

        const confidence = calculateConfidence({
            prompt: trimmedMessage,
            evidenceCount: evidenceBundle.evidence.length,
            aiReply: rawReply
        });
        const warnings = buildWarnings({
            dataQuery: evidenceBundle.dataQuery,
            evidenceCount: evidenceBundle.evidence.length,
            confidence
        });

        if (mode === 'evidence-fallback') {
            warnings.push('AI provider is unavailable; response was generated from ERP evidence and safety rules.');
            if (providerErrorMessage) {
                warnings.push(providerErrorMessage);
            }
        }

        const reply = rawReply || buildSafeFallback(trimmedMessage);

        res.json({
            success: true,
            reply,
            confidence,
            evidence: evidenceBundle.evidence,
            warnings,
            actionSuggestions: evidenceBundle.actionSuggestions,
            mode
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

/**
 * Predict demand for a product
 */
exports.predictDemand = async (req, res, next) => {
    try {
        const { productId, lookbackDays, horizonDays } = req.body;

        if (!productId) {
            return res.status(400).json({ success: false, message: 'Product ID required' });
        }

        const result = await predictionsService.predictDemand({
            productId,
            lookbackDays: lookbackDays || 30,
            horizonDays: horizonDays || 30
        });

        res.json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * Predict trends for top products
 */
exports.predictTrends = async (req, res, next) => {
    try {
        const { lookbackDays } = req.query;

        const result = await predictionsService.predictTrends({
            lookbackDays: Number(lookbackDays || 30)
        });

        res.json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * Detect sales anomalies
 */
exports.detectSalesAnomalies = async (req, res, next) => {
    try {
        const { lookbackDays } = req.query;

        const result = await anomalyService.detectSalesAnomalies({
            lookbackDays: Number(lookbackDays || 30)
        });

        res.json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * Detect inventory anomalies
 */
exports.detectInventoryAnomalies = async (req, res, next) => {
    try {
        const { lookbackDays } = req.query;

        const result = await anomalyService.detectInventoryAnomalies({
            lookbackDays: Number(lookbackDays || 30)
        });

        res.json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * Detect business anomalies (invoices, payments)
 */
exports.detectBusinessAnomalies = async (req, res, next) => {
    try {
        const { lookbackDays } = req.query;

        const result = await anomalyService.detectBusinessAnomalies({
            lookbackDays: Number(lookbackDays || 30)
        });

        res.json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * Get product recommendations for customer
 */
exports.recommendProductsForCustomer = async (req, res, next) => {
    try {
        const { customerId } = req.body;

        if (!customerId) {
            return res.status(400).json({ success: false, message: 'Customer ID required' });
        }

        const result = await recommendationsService.recommendProductsToCustomer(customerId);

        res.json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * Get upsell and cross-sell strategies
 */
exports.getUpsellCrossSellStrategy = async (req, res, next) => {
    try {
        const result = await recommendationsService.recommendUpsellCrossSell();

        res.json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * Get inventory optimization recommendations
 */
exports.getInventoryRecommendations = async (req, res, next) => {
    try {
        const result = await recommendationsService.recommendInventoryActions();

        res.json(result);
    } catch (error) {
        next(error);
    }
};
