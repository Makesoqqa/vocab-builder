import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    try {
        const { image } = await req.json(); // Expecting base64 image string

        if (!process.env.GEMINI_API_KEY) {
            // Mock response if no key for demo purposes
            return NextResponse.json({
                words: [
                    { original: "Mock Word", translation: "So'z" },
                    { original: "Example", translation: "Misol" }
                ]
            });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Simple prompt to extract words
        const prompt = "Extract all English words from this image and provide their Uzbek translation in JSON format: [{ original: 'word', translation: 'soz' }]";

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: image.split(",")[1], // Remove "data:image/jpeg;base64," prefix if present
                    mimeType: "image/jpeg",
                },
            },
        ]);

        const response = await result.response;
        const text = response.text();

        // Parse JSON from markdown code block if present
        const jsonStr = text.replace(/```json/g, "").replace(/```/g, "");
        const words = JSON.parse(jsonStr);

        return NextResponse.json({ words });
    } catch (error) {
        console.error("Scan error:", error);
        return NextResponse.json({ error: "Failed to scan image" }, { status: 500 });
    }
}
