const Anthropic = require('@anthropic-ai/sdk');

let anthropicClient;

function getAnthropicClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    const error = new Error('ANTHROPIC_API_KEY is not set. Please check your .env file.');
    error.statusCode = 500;
    error.code = 'CONFIG_ERROR';
    throw error;
  }

  if (!anthropicClient) {
    anthropicClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  return anthropicClient;
}

async function callClaude({ systemPrompt, userPrompt, model = 'claude-3-5-sonnet-20241022', maxTokens = 1200, temperature = 0.4 }) {
  const client = getAnthropicClient();

  const response = await client.messages.create({
    model,
    system: systemPrompt,
    max_tokens: maxTokens,
    temperature,
    messages: [
      {
        role: 'user',
        content: userPrompt,
      },
    ],
  });

  const text = response.content
    .filter((item) => item.type === 'text')
    .map((item) => item.text)
    .join('\n')
    .trim();

  if (!text) {
    const error = new Error('Claude returned an empty response.');
    error.statusCode = 502;
    error.code = 'EMPTY_AI_RESPONSE';
    throw error;
  }

  return {
    text,
    raw: response,
  };
}

module.exports = {
  callClaude,
};
