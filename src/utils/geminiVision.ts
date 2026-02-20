// AI Vision API Utility - Using Groq as free alternative
// Groq free tier: no credit card required, supports vision models
//
// API key resolution order:
// 1. User-provided Gemini key stored in localStorage under 'gemini_api_key'
// 2. Build-time GROQ_API_KEY  (set via Vercel env vars – note: embedded in client bundle)
// 3. Build-time GEMINI_API_KEY (set via Vercel env vars – note: embedded in client bundle)

declare const process: { env: { GEMINI_API_KEY?: string; GROQ_API_KEY?: string } };

interface DashboardData {
    odometer: number | null;
    consumption: number | null;
    distance: number | null;
    avgSpeed: number | null;
}

interface ReceiptData {
    pricePerLiter: number | null;
    totalAmount: number | null;
    liters: number | null;
}

export async function analyzeDashboardPhoto(imageBase64: string, mode: 'consumption' | 'distance' | 'all' = 'all'): Promise<DashboardData> {
    let prompt: string;

    if (mode === 'consumption') {
        prompt = `Bu araç gösterge paneli fotoğrafından SADECE şu bilgiyi çıkar:
- Ortalama yakıt tüketimi (L/100km olarak gösterilen değer)
- Kilometre sayacı (varsa)

Ekranda "Tüketim" veya "L/100" yazan değeri bul.
ÖNEMLİ: Sadece net olarak okuduğun değerleri yaz.

SADECE JSON formatında döndür:
{"consumption": number veya null, "odometer": number veya null, "distance": null}`;
    } else if (mode === 'distance') {
        prompt = `Bu araç gösterge paneli fotoğrafından şu bilgileri çıkar:
- Yapılan mesafe / trip distance (km olarak)
- Ortalama hız (km/h olarak)
- Kilometre sayacı (varsa)

Ekranda "Yol bilgisi" veya yapılan km değerini ve ortalama hız (Ø km/h) değerini bul.
ÖNEMLİ: Sadece net olarak okuduğun değerleri yaz.

SADECE JSON formatında döndür:
{"distance": number veya null, "avgSpeed": number veya null, "odometer": number veya null, "consumption": null}`;
    } else {
        prompt = `Bu araç gösterge paneli fotoğrafından şu bilgileri çıkar:
- Kilometre sayacı (toplam km)
- Ortalama yakıt tüketimi (L/100km)
- Yapılan mesafe (km)

SADECE JSON formatında döndür:
{"odometer": number veya null, "consumption": number veya null, "distance": number veya null}`;
    }

    try {
        console.log('Analyzing dashboard photo with mode:', mode);
        const response = await callVisionAPI(imageBase64, prompt);
        console.log('AI Raw Response:', response);

        // Clean up markdown code blocks if present
        const cleanResponse = response.replace(/```json\n|\n```/g, '').replace(/```/g, '');

        const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            console.log('Parsed Data:', parsed);
            return parsed;
        }
        throw new Error('AI yanıtı JSON formatında değil: ' + response.substring(0, 100));
    } catch (error: any) {
        console.error('Dashboard analysis error:', error);
        throw new Error(error.message || 'Analiz başarısız');
    }
}

export async function analyzeReceiptPhoto(imageBase64: string): Promise<ReceiptData> {
    const prompt = `Bu benzin istasyonu fişinden şu bilgileri çıkar:
- Litre başına fiyat (TL/L)
- Toplam ödenen tutar (TL)
- Alınan yakıt miktarı (Litre)

SADECE JSON formatında döndür:
{"pricePerLiter": number veya null, "totalAmount": number veya null, "liters": number veya null}`;

    try {
        console.log('Analyzing receipt photo...');
        const response = await callVisionAPI(imageBase64, prompt);
        console.log('AI Receipt Raw Response:', response);

        const cleanResponse = response.replace(/```json\n|\n```/g, '').replace(/```/g, '');
        const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            console.log('Parsed Receipt Data:', parsed);
            return parsed;
        }
        throw new Error('AI yanıtı JSON formatında değil');
    } catch (error: any) {
        console.error('Receipt analysis error:', error);
        throw new Error(error.message || 'Analiz başarısız');
    }
}

async function callVisionAPI(imageBase64: string, prompt: string): Promise<string> {
    // Prefer user-provided key from localStorage (runtime, never embedded in bundle)
    try {
        const userGeminiKey = localStorage.getItem('gemini_api_key');
        if (userGeminiKey) {
            return await callGeminiVision(imageBase64, prompt, userGeminiKey);
        }
    } catch {
        // localStorage may be unavailable in some environments; fall through to build-time keys
    }

    // Try Groq build-time key (set via Vercel env vars; embedded in client bundle)
    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey) {
        return await callGroqVision(imageBase64, prompt, groqKey);
    }

    // Fallback to Gemini build-time key (set via Vercel env vars; embedded in client bundle)
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
        return await callGeminiVision(imageBase64, prompt, geminiKey);
    }

    throw new Error('API anahtarı yapılandırılmamış. Ayarlardan Gemini API anahtarı girin veya Vercel\'de GROQ_API_KEY / GEMINI_API_KEY ayarlayın.');
}

async function callGroqVision(imageBase64: string, prompt: string, apiKey: string): Promise<string> {
    let imageUrl = imageBase64;
    if (!imageBase64.startsWith('data:')) {
        imageUrl = `data:image/jpeg;base64,${imageBase64}`;
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'meta-llama/llama-4-scout-17b-16e-instruct',
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: prompt },
                        { type: 'image_url', image_url: { url: imageUrl } }
                    ]
                }
            ],
            max_tokens: 500,
            temperature: 0.1
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
}

async function callGeminiVision(imageBase64: string, prompt: string, apiKey: string): Promise<string> {
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: prompt },
                        { inline_data: { mime_type: 'image/jpeg', data: base64Data } }
                    ]
                }],
                generationConfig: { temperature: 0.1, maxOutputTokens: 256 }
            })
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}
