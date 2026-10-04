import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const EXTRACTION_PROMPT = `Look at this photo and extract information as JSON.
                        Return ONLY valid JSON, no markdown, no explanation, in this exact shape:
                        {
                        "category": "bill" | "school" | "work" | "promo" | "receipt" | "other",
                        "title": string,
                        "deadline": string or null (ISO 8601 date, e.g. "2026-01-31"),
                        "fields": {
                            "key_name": { "value": string, "confidence": number between 0 and 1 }
                        }
                        }
                        Confidence should reflect how certain you are that the value was read correctly, based on image clarity, legibility, and ambiguity.`;

const MAX_ATTEMPTS = 3;
const BASE_DELAY_MS = 3000;
const RETRYABLE_STATUS = [429, 500, 503];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryable = (err: unknown) =>
  RETRYABLE_STATUS.includes((err as { status?: number })?.status ?? 0);

export async function extractDataFromImage(buffer: Buffer, mimeType: string) {
  const base64Image = buffer.toString("base64");
  const model = genAI.getGenerativeModel({ model: "gemini-3.8-flash" });

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const result = await model.generateContent([
        { text: EXTRACTION_PROMPT },
        { inlineData: { mimeType, data: base64Image } },
      ]);

      const text = result.response.text();
      const cleaned = text.replace(/```json|```/g, "").trim();
      return JSON.parse(cleaned);
    } catch (err) {
      if (!isRetryable(err) || attempt === MAX_ATTEMPTS) throw err;

      const delay = BASE_DELAY_MS * 2 ** (attempt - 1);
      console.log(
        `failed: retrying (attempt ${attempt}/${MAX_ATTEMPTS}, status ${
          (err as { status?: number }).status
        }) in ${delay}ms`,
      );
      await sleep(delay);
    }
  }

  throw new Error("Extraction failed");
}
