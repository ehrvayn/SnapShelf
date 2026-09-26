import type { Request, Response } from "express";
import { extractDataFromImage } from "../services/extractionService.js";

export async function uploadItem(req: Request, res: Response) {
  if (!req.file) {
    return res.status(400).json({ error: "No photo received" });
  }

  try {
    const extracted = await extractDataFromImage(req.file.buffer, req.file.mimetype);
    console.log("Extracted:", extracted);
    res.json({ ok: true, extracted });
  } catch (err) {
    console.error("Extraction failed:", err);
    res.status(500).json({ error: "Extraction failed" });
  }
}