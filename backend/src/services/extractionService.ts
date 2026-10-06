import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MODEL = "qwen/qwen3.8-27b";

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
const MAX_RETRY_WAIT_MS = 30_000;
const RETRYABLE_STATUS = [429, 500, 503];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type GroqError = {
  status?: number;
  headers?: Record<string, string>;
};

const isRetryable = (err: unknown) => {
  const e = err as GroqError;
  if (!RETRYABLE_STATUS.includes(e?.status ?? 0)) return false;

  const retryAfter = parseFloat(e.headers?.["retry-after"] ?? "");
  if (!Number.isNaN(retryAfter) && retryAfter * 1000 > MAX_RETRY_WAIT_MS) {
    return false;
  }
  return true;
};

export async function extractDataFromImage(buffer: Buffer, mimeType: string) {
  const base64Image = buffer.toString("base64");

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const completion = await groq.chat.completions.create({
        model: MODEL,
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: EXTRACTION_PROMPT },
              {
                type: "image_url",
                image_url: { url: `data:${mimeType};base64,${base64Image}` },
              },
            ],
          },
        ],
      });

      const text = completion.choices[0]?.message?.content ?? "";
      const cleaned = text.replace(/```json|```/g, "").trim();
      return JSON.parse(cleaned);
    } catch (err) {
      if (!isRetryable(err) || attempt === MAX_ATTEMPTS) throw err;

      const delay = BASE_DELAY_MS * 2 ** (attempt - 1);
      console.log(
        `failed: retrying (attempt ${attempt}/${MAX_ATTEMPTS}, status ${
          (err as GroqError).status
        }) in ${delay}ms`,
      );
      await sleep(delay);
    }
  }

  throw new Error("Extraction failed");
}
