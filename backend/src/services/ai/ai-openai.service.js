const http = require('http');
const https = require('https');
const { URL } = require('url');

const OLLAMA_BASE_URL = (process.env.OLLAMA_BASE_URL || 'http://localhost:11434').replace(/\/$/, '');
const MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:1.5b';

const DEFAULT_CHAT_OPTIONS = {
  temperature: Number(process.env.OLLAMA_TEMPERATURE || 0.2),
  top_p: Number(process.env.OLLAMA_TOP_P || 0.92),
  top_k: Number(process.env.OLLAMA_TOP_K || 40),
  repeat_penalty: Number(process.env.OLLAMA_REPEAT_PENALTY || 1.08),
  num_ctx: Number(process.env.OLLAMA_NUM_CTX || 8192),
  num_predict: Number(process.env.OLLAMA_NUM_PREDICT || 1000),
};

const buildMessages = (messages) => messages.map((message) => ({
  role: message.role,
  content: message.content,
}));

const resolveOllamaOptions = (options = {}) => ({
  ...DEFAULT_CHAT_OPTIONS,
  temperature: options.temperature ?? DEFAULT_CHAT_OPTIONS.temperature,
  top_p: options.top_p ?? DEFAULT_CHAT_OPTIONS.top_p,
  top_k: options.top_k ?? DEFAULT_CHAT_OPTIONS.top_k,
  repeat_penalty: options.repeat_penalty ?? DEFAULT_CHAT_OPTIONS.repeat_penalty,
  num_ctx: options.num_ctx ?? DEFAULT_CHAT_OPTIONS.num_ctx,
  num_predict: options.max_tokens ?? options.num_predict ?? DEFAULT_CHAT_OPTIONS.num_predict,
});

const postJson = async (urlString, payload) => {
  const url = new URL(urlString);
  const client = url.protocol === 'https:' ? https : http;

  return new Promise((resolve, reject) => {
    const request = client.request(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port,
        path: `${url.pathname}${url.search}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      },
      (response) => {
        let body = '';

        response.setEncoding('utf8');
        response.on('data', (chunk) => {
          body += chunk;
        });
        response.on('end', () => {
          if (response.statusCode < 200 || response.statusCode >= 300) {
            return reject(new Error(`Ollama request failed (${response.statusCode}): ${body}`));
          }

          try {
            resolve(JSON.parse(body));
          } catch (error) {
            reject(error);
          }
        });
      }
    );

    request.on('error', reject);
    request.write(JSON.stringify(payload));
    request.end();
  });
};

const callOllamaChat = async (messages, options = {}) => {
  return postJson(`${OLLAMA_BASE_URL}/api/chat`, {
    model: MODEL,
    messages: buildMessages(messages),
    stream: false,
    options: resolveOllamaOptions(options),
  });
};

/**
 * Call Ollama for chat completions
 */
exports.getChatCompletion = async (messages, options = {}) => {
  try {
    const response = await callOllamaChat(messages, options);
    const content = response?.message?.content || '';

    return {
      success: true,
      content,
      tokens_used: response?.eval_count || 0,
      model: response?.model || MODEL,
    };
  } catch (error) {
    const errorMessage = error?.message || 'Ollama request failed';

    console.error('Ollama Error:', errorMessage);
    return {
      success: false,
      error: errorMessage,
      content: errorMessage,
    };
  }
};

/**
 * Analyze text and extract structured data
 */
exports.analyzeText = async (text, prompt) => {
  try {
    const response = await callOllamaChat([
      { role: 'system', content: 'You are a data analysis assistant. Extract and analyze information precisely. Always respond in JSON format.' },
      { role: 'user', content: `${prompt}\n\nData to analyze:\n${text}` },
    ], {
      temperature: 0.1,
      max_tokens: 1000,
    });

    const content = response?.message?.content || '';
    try {
      return JSON.parse(content);
    } catch {
      return { raw: content };
    }
  } catch (error) {
    console.error('Analysis Error:', error.message);
    return { error: error.message };
  }
};

/**
 * Generate predictions based on data
 */
exports.generatePrediction = async (dataContext, predictionTask) => {
  try {
    const response = await callOllamaChat([
      { role: 'system', content: 'You are an expert business analyst. Provide accurate predictions with reasoning.' },
      { role: 'user', content: `Task: ${predictionTask}\n\nData Context:\n${JSON.stringify(dataContext, null, 2)}` },
    ], {
      temperature: 0.3,
      max_tokens: 800,
    });

    return {
      success: true,
      prediction: response?.message?.content || '',
      tokens_used: response?.eval_count || 0,
    };
  } catch (error) {
    console.error('Prediction Error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Detect anomalies in data
 */
exports.detectAnomalies = async (dataArray, context) => {
  try {
    const response = await callOllamaChat([
      { role: 'system', content: 'You are a data anomaly detection expert. Identify unusual patterns, outliers, and suspicious transactions. Respond in JSON format with findings.' },
      { role: 'user', content: `Context: ${context}\n\nAnalyze this data for anomalies:\n${JSON.stringify(dataArray, null, 2)}` },
    ], {
      temperature: 0.1,
      max_tokens: 1000,
    });

    const content = response?.message?.content || '';
    try {
      return { success: true, ...JSON.parse(content) };
    } catch {
      return { success: true, analysis: content };
    }
  } catch (error) {
    console.error('Anomaly Detection Error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Generate recommendations
 */
exports.generateRecommendations = async (context, topic) => {
  try {
    const response = await callOllamaChat([
      { role: 'system', content: 'You are a business recommendation expert. Provide actionable, specific recommendations.' },
      { role: 'user', content: `Generate recommendations for: ${topic}\n\nContext:\n${JSON.stringify(context, null, 2)}` },
    ], {
      temperature: 0.5,
      max_tokens: 800,
    });

    return {
      success: true,
      recommendations: response?.message?.content || '',
      tokens_used: response?.eval_count || 0,
    };
  } catch (error) {
    console.error('Recommendation Error:', error.message);
    return { success: false, error: error.message };
  }
};
