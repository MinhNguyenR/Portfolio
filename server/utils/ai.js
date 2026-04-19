/**
 * Call OpenRouter API with retry logic
 */
async function callOpenRouter(messages, model = 'google/gemini-2.5-flash-lite', maxRetries = 5) {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not defined in .env');
  }

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://portfolio.nguyendangtuongminh.com',
          'X-Title': 'Hachiware Portfolio Admin',
        },
        body: JSON.stringify({
          model,
          messages,
          response_format: { type: 'json_object' },
        }),
      });

      if (response.status === 429 || response.status >= 500) {
        const waitMs = Math.min(1000 * Math.pow(2, attempt), 10000);
        await new Promise(r => setTimeout(r, waitMs));
        continue;
      }

      const data = await response.json();
      if (data.choices?.[0]?.message?.content) {
        return data.choices[0].message.content;
      }
      
      throw new Error(`OpenRouter error: ${JSON.stringify(data.error || data)}`);
    } catch (err) {
      if (attempt === maxRetries) throw err;
      await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
  return null;
}

/**
 * Translate an object with multiple fields from Vietnamese to English and German
 */
async function translateToEnDe(obj) {
  if (!obj || Object.keys(obj).length === 0) return { en: {}, de: {} };
  
  const prompt = `Translate the following object values from Vietnamese to English (en) and German (de). 
Return a JSON object with exactly two top-level keys: "en" and "de".
Each should contain the translated fields.
Keep markdown formatting and emojis exactly as they are.
Fields to translate: ${Object.keys(obj).join(', ')}.

Object to translate:
${JSON.stringify(obj, null, 2)}`;

  const result = await callOpenRouter([
    { role: 'system', content: 'You are a professional translator (Vietnamese, English, German). Respond ONLY with the requested JSON format.' },
    { role: 'user', content: prompt }
  ]);

  if (!result) return { en: {}, de: {} };
  try {
    return JSON.parse(result);
  } catch (e) {
    console.error('Translation parse error:', result);
    return { en: {}, de: {} };
  }
}

module.exports = { callOpenRouter, translateToEnDe };
