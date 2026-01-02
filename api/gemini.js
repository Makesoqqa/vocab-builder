
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    // CORS configuration for Vercel Serverless Function
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*'); // Adjust this in production
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { prompt, imageBase64 } = req.body;
    const apiKey = process.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'Server misconfiguration: API Key missing' });
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        let result;
        if (imageBase64) {
            const base64Data = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;
            const imagePart = {
                inlineData: {
                    data: base64Data,
                    mimeType: "image/jpeg",
                },
            };
            const augmentedPrompt = prompt + (prompt.includes("JSON") ? "" : ". Return the result in pure JSON format if possible.");
            result = await model.generateContent([augmentedPrompt, imagePart]);
        } else {
            result = await model.generateContent(prompt);
        }

        const response = await result.response;
        const text = response.text();
        res.status(200).json({ text });
    } catch (error) {
        console.error("Gemini API backend error:", error);
        res.status(500).json({ error: error.message });
    }
}
