const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const {
    CallToolRequestSchema,
    ListToolsRequestSchema
} = require("@modelcontextprotocol/sdk/types.js");
const aiOpenAI = require('./ai-openai.service');
const predictionsService = require('./ai-predictions.service');
const anomalyService = require('./ai-anomaly.service');
const recommendationsService = require('./ai-recommendations.service');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });

const server = new Server(
    {
        name: "erp-ai-assistant",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

/**
 * List available tools exposed through MCP.
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "ask_ai",
                description: "Ask the AI assistant any question (general, technical, or business).",
                inputSchema: {
                    type: "object",
                    properties: {
                        prompt: {
                            type: "string",
                            description: "The prompt or question to send to the AI.",
                        },
                    },
                    required: ["prompt"],
                },
            },
            {
                name: "predict_demand",
                description: "Predict demand for a specific product using ERP history.",
                inputSchema: {
                    type: "object",
                    properties: {
                        productId: { type: ["string", "number"], description: "Product ID" },
                        lookbackDays: { type: "number", description: "Historical window in days" },
                        horizonDays: { type: "number", description: "Forecast horizon in days" },
                    },
                    required: ["productId"],
                },
            },
            {
                name: "predict_trends",
                description: "Predict trends for the top-selling products.",
                inputSchema: {
                    type: "object",
                    properties: {
                        lookbackDays: { type: "number", description: "Historical window in days" },
                    },
                },
            },
            {
                name: "detect_sales_anomalies",
                description: "Detect unusual patterns in recent sales.",
                inputSchema: {
                    type: "object",
                    properties: {
                        lookbackDays: { type: "number", description: "Historical window in days" },
                    },
                },
            },
            {
                name: "detect_inventory_anomalies",
                description: "Detect unusual patterns in recent inventory movements.",
                inputSchema: {
                    type: "object",
                    properties: {
                        lookbackDays: { type: "number", description: "Historical window in days" },
                    },
                },
            },
            {
                name: "detect_business_anomalies",
                description: "Detect business and payment anomalies from invoice data.",
                inputSchema: {
                    type: "object",
                    properties: {
                        lookbackDays: { type: "number", description: "Historical window in days" },
                    },
                },
            },
            {
                name: "recommend_products_for_customer",
                description: "Recommend products for a customer based on purchase history.",
                inputSchema: {
                    type: "object",
                    properties: {
                        customerId: { type: ["string", "number"], description: "Customer ID" },
                    },
                    required: ["customerId"],
                },
            },
            {
                name: "recommend_upsell_cross_sell",
                description: "Generate upsell and cross-sell strategies.",
                inputSchema: {
                    type: "object",
                    properties: {},
                },
            },
            {
                name: "recommend_inventory_actions",
                description: "Generate inventory optimization recommendations.",
                inputSchema: {
                    type: "object",
                    properties: {},
                },
            },
        ],
    };
});

/**
 * Handle tool calls.
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const args = request.params.arguments || {};

    try {
        switch (request.params.name) {
            case "ask_ai": {
                const prompt = String(args.prompt || '').trim();

                if (!prompt) {
                    throw new Error('prompt is required');
                }

                const response = await aiOpenAI.getChatCompletion([
                    {
                        role: 'system',
                        content: 'You are a general-purpose AI assistant like ChatGPT and Copilot. Answer from the user\'s perspective, directly and completely. Infer intent when needed, ask a short clarifying question if the request is ambiguous, and provide practical next steps or drafts when useful. Use business context only when relevant, but do not restrict yourself to ERP-only answers.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ], {
                    temperature: 0.2,
                    max_tokens: 1200,
                });

                if (!response.success) {
                    throw new Error(response.error || 'Ollama request failed');
                }

                return {
                    content: [
                        {
                            type: "text",
                            text: response.content || '',
                        },
                    ],
                };
            }

            case "predict_demand": {
                const result = await predictionsService.predictDemand({
                    productId: args.productId,
                    lookbackDays: Number(args.lookbackDays || 30),
                    horizonDays: Number(args.horizonDays || 30),
                });

                return {
                    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
                    isError: !result.success,
                };
            }

            case "predict_trends": {
                const result = await predictionsService.predictTrends({
                    lookbackDays: Number(args.lookbackDays || 30),
                });

                return {
                    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
                    isError: !result.success,
                };
            }

            case "detect_sales_anomalies": {
                const result = await anomalyService.detectSalesAnomalies({
                    lookbackDays: Number(args.lookbackDays || 30),
                });

                return {
                    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
                    isError: !result.success,
                };
            }

            case "detect_inventory_anomalies": {
                const result = await anomalyService.detectInventoryAnomalies({
                    lookbackDays: Number(args.lookbackDays || 30),
                });

                return {
                    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
                    isError: !result.success,
                };
            }

            case "detect_business_anomalies": {
                const result = await anomalyService.detectBusinessAnomalies({
                    lookbackDays: Number(args.lookbackDays || 30),
                });

                return {
                    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
                    isError: !result.success,
                };
            }

            case "recommend_products_for_customer": {
                const result = await recommendationsService.recommendProductsToCustomer(args.customerId);

                return {
                    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
                    isError: !result.success,
                };
            }

            case "recommend_upsell_cross_sell": {
                const result = await recommendationsService.recommendUpsellCrossSell();

                return {
                    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
                    isError: !result.success,
                };
            }

            case "recommend_inventory_actions": {
                const result = await recommendationsService.recommendInventoryActions();

                return {
                    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
                    isError: !result.success,
                };
            }

            default:
                throw new Error(`Tool not found: ${request.params.name}`);
        }
    } catch (error) {
        console.error("MCP Tool Error:", error);
        return {
            content: [
                {
                    type: "text",
                    text: `Error calling AI tool: ${error.message}`,
                },
            ],
            isError: true,
        };
    }
});

/**
 * Start the server using stdio transport.
 */
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("ERP AI MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Server Error:", error);
    process.exit(1);
});
