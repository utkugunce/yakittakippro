/**
 * Text-only AI assistant calls (mirrors utils/geminiVision.ts but without
 * images). Tries Groq first (free tier), then Gemini. The Gemini key may also
 * come from the in-app setting (store.geminiApiKey) passed as an override.
 */

declare const process: { env: { GEMINI_API_KEY?: string; GROQ_API_KEY?: string } };

const SYSTEM_PREAMBLE =
  'Sen TripBook adlı araç yakıt/gider takip uygulamasının asistanısın. ' +
  'Yalnızca verilen kullanıcı verilerine dayanarak Türkçe, kısa ve net yanıt ver. ' +
  'Para birimi TL. Veride olmayan bir şey sorulursa bunu belirt.';

export async function askAssistant(
  question: string,
  context: string,
  geminiKeyOverride?: string
): Promise<string> {
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) return callGroqText(question, context, groqKey);

  const geminiKey = geminiKeyOverride || process.env.GEMINI_API_KEY;
  if (geminiKey) return callGeminiText(question, context, geminiKey);

  throw new Error(
    'AI anahtarı yapılandırılmamış. Ayarlar bölümünden Gemini API anahtarı girin ' +
      'veya ortamda GROQ_API_KEY / GEMINI_API_KEY tanımlayın.'
  );
}

async function callGroqText(question: string, context: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: `${SYSTEM_PREAMBLE}\n\nVERİLER:\n${context}` },
        { role: 'user', content: question },
      ],
      max_tokens: 600,
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API hatası: ${response.status} - ${errorText}`);
  }
  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

async function callGeminiText(question: string, context: string, apiKey: string): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { parts: [{ text: `${SYSTEM_PREAMBLE}\n\nVERİLER:\n${context}\n\nSORU: ${question}` }] },
        ],
        generationConfig: { temperature: 0.2, maxOutputTokens: 600 },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API hatası: ${response.status} - ${errorText}`);
  }
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}
