const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const {
    CallToolRequestSchema,
    ListToolsRequestSchema
} = require("@modelcontextprotocol/sdk/types.js");
const { HfInference } = require("@huggingface/inference");
require('dotenv').config({ path: '../../.env' });

const hf = new HfInference(process.env.HUGGINGFACE_TOKEN);
const MODEL = "mistralai/Mistral-7B-Instruct-v0.3";

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
 * List available tools.
 * In this case, we have a tool to ask the AI.
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "ask_ai",
                description: "Ask a question to the AI assistant regarding ERP data or general queries.",
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
        ],
    };
});

/**
 * Handle tool calls.
 * This is where we call Hugging Face.
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "ask_ai") {
        const prompt = request.params.arguments.prompt;

        try {
            const response = await hf.textGeneration({
                model: MODEL,
                inputs: prompt,
                parameters: {
                    max_new_tokens: 500,
                    return_full_text: false,
                },
            });

            return {
                content: [
                    {
                        type: "text",
                        text: response.generated_text,
                    },
                ],
            };
        } catch (error) {
            console.error("HF Inference Error:", error);
            return {
                content: [
                    {
                        type: "text",
                        text: `Error calling AI: ${error.message}`,
                    },
                ],
                isError: true,
            };
        }
    }

    throw new Error(`Tool not found: ${request.params.name}`);
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
