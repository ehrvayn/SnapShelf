import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const EXTRACTION_PROMPT = `Look at this photo and extract information as JSON.
                        Return ONLY valid JSON, no markdown, no explanation, in this exact shape:
                        {
                        "category": "bill" | "school" | "work" | "promo" | "receipt" | "other",
                        "title": string,
                        "deadline": string or null (ISO 8601 date, e.g. "2026-01-31"),
                        "fields": { "key": "value" }
                        }`;

export async function extractDataFromImage(buffer: Buffer, mimeType: string) {
  const base64Image = buffer.toString("base64");
  const model = genAI.getGenerativeModel({ model: "gemini-3.8-flash" });

  const result = await model.generateContent([
    { text: EXTRACTION_PROMPT },
    { inlineData: { mimeType, data: base64Image } },
  ]);

  const text = result.response.text();
  const cleaned = text.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}