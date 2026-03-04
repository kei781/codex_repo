const { GoogleGenerativeAI } = require('@google/generative-ai');

let geminiClient;

function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY) {
    const error = new Error('GEMINI_API_KEY is not set. Please check your .env file.');
    error.statusCode = 500;
    error.code = 'CONFIG_ERROR';
    throw error;
  }

  if (!geminiClient) {
    geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  return geminiClient;
}

async function callGemini({ systemPrompt, userPrompt, model = 'gemini-2.5-flash', maxTokens = 12000, temperature = 0.4 }) {
  const client = getGeminiClient();

  // Gemini 모델 초기화 (시스템 프롬프트 주입)
  const generativeModel = client.getGenerativeModel({
    model,
    systemInstruction: systemPrompt,
  });

  const generationConfig = {
    maxOutputTokens: maxTokens,
    temperature,
  };

  try {
    const response = await generativeModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig,
    });

    const text = response.response.text();

    if (!text) {
      const error = new Error('Gemini returned an empty response.');
      error.statusCode = 502;
      error.code = 'EMPTY_AI_RESPONSE';
      throw error;
    }

    return {
      text,
      raw: response,
    };
  } catch (err) {
    console.error('Gemini API Error:', err);
    throw err;
  }
}

module.exports = {
  callGemini,
};