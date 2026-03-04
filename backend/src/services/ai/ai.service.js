const { Client } = require("@modelcontextprotocol/sdk/client/index.js");
const { StdioClientTransport } = require("@modelcontextprotocol/sdk/client/stdio.js");
const path = require('path');

class AIService {
    constructor() {
        this.client = null;
        this.transport = null;
    }

    /**
     * Initialize and connect to the MCP server.
     */
    async ensureConnected() {
        if (this.client) return;

        try {
            this.client = new Client(
                {
                    name: "erp-backend-client",
                    version: "1.0.0",
                },
                {
                    capabilities: {},
                }
            );

            const serverPath = path.join(__dirname, 'mcp-server.js');
            this.transport = new StdioClientTransport({
                command: "node",
                args: [serverPath],
            });

            await this.client.connect(this.transport);
            console.log("Connected to MCP Server");
        } catch (error) {
            console.error("Failed to connect to MCP Server:", error);
            this.client = null;
            this.transport = null;
            throw error;
        }
    }

    /**
     * Ask the AI a question using the MCP server.
     * @param {string} prompt 
     * @returns {Promise<string>}
     */
    async askAI(prompt) {
        await this.ensureConnected();

        try {
            const result = await this.client.callTool({
                name: "ask_ai",
                arguments: { prompt },
            });

            if (result.isError) {
                throw new Error(result.content[0].text);
            }

            return result.content[0].text;
        } catch (error) {
            console.error("MCP callTool error:", error);
            throw error;
        }
    }
}

// Export a singleton instance
module.exports = new AIService();
