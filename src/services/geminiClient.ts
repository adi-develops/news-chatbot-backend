import { GoogleGenAI, HarmBlockThreshold, HarmCategory } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("❌ Missing GEMINI_API_KEY in environment variables");
  process.exit(1);
}

const genAI = new GoogleGenAI({apiKey: GEMINI_API_KEY, });

export async function getGeminiResponse(context: string, query: string): Promise<string> {

  const prompt = `Context:\n${context}\n\nUser: ${query}\nBot:`;
  try {
    const response = await genAI.models.generateContent({
    model: 'gemini-2.0-flash-001',
    contents: prompt,
  });

    return response.text || "No response generated";
  } catch (err: any) {
    console.error("❌ Gemini API error:", err.message);
    throw new Error("Gemini API error: " + err.message);
  }
}
