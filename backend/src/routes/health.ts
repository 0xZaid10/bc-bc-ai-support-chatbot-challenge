import { Router, Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";

const router = Router();

router.get("/health", async (_req: Request, res: Response): Promise<void> => {
  let geminiConnected = false;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "ping",
      });
      if (response && response.text) {
        geminiConnected = true;
      }
    }
  } catch {
    geminiConnected = false;
  }

  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    geminiConnected,
  });
});

export default router;