import { GoogleGenAI } from "@google/genai";
import { logger } from "../utils/logger";
import { getFallbackResponse, getFallbackClassification } from "../utils/fallback";

export interface ChatMessage {
  role: "user" | "model";
  parts: string;
}

export interface ClassificationResult {
  priority: "low" | "medium" | "high" | "urgent";
  category: "billing" | "bug" | "feature" | "account" | "general";
  sentiment: "positive" | "neutral" | "negative";
  detectedLanguage: "en" | "es";
}

export interface ChatResponse {
  reply: string;
  detectedLanguage: "en" | "es";
}

const sessionHistories = new Map<string, ChatMessage[]>();

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }
  return new GoogleGenAI({ apiKey });
}

export async function sendChatMessage(
  sessionId: string,
  userMessage: string,
  languageHint?: string
): Promise<ChatResponse> {
  try {
    const client = getClient();

    if (!sessionHistories.has(sessionId)) {
      sessionHistories.set(sessionId, []);
    }

    const history = sessionHistories.get(sessionId)!;

    const systemPrompt = `You are a helpful customer support assistant. 
Detect the language of the user's message and respond in the same language.
If the user writes in Spanish, respond in Spanish. If in English, respond in English.
${languageHint ? `The user's preferred language is: ${languageHint === "es" ? "Spanish" : "English"}.` : ""}
Be concise, professional, and empathetic. Help users with billing issues, bugs, feature requests, and account problems.
At the end of your response, on a new line, add exactly: DETECTED_LANG:en or DETECTED_LANG:es based on the language you detected.`;

    const conversationParts: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    for (const msg of history) {
      conversationParts.push({
        role: msg.role,
        parts: [{ text: msg.parts }],
      });
    }

    conversationParts.push({
      role: "user",
      parts: [{ text: userMessage }],
    });

    const fullPrompt = `${systemPrompt}\n\nConversation so far:\n${history
      .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.parts}`)
      .join("\n")}\nUser: ${userMessage}\nAssistant:`;

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
    });

    const rawText = response.text ?? "";

    let detectedLanguage: "en" | "es" = "en";
    let reply = rawText;

    const langMatch = rawText.match(/DETECTED_LANG:(en|es)/i);
    if (langMatch) {
      detectedLanguage = langMatch[1].toLowerCase() as "en" | "es";
      reply = rawText.replace(/\nDETECTED_LANG:(en|es)/i, "").trim();
    } else if (languageHint === "es") {
      detectedLanguage = "es";
    }

    history.push({ role: "user", parts: userMessage });
    history.push({ role: "model", parts: reply });

    if (history.length > 20) {
      history.splice(0, 2);
    }

    sessionHistories.set(sessionId, history);

    return { reply, detectedLanguage };
  } catch (error) {
    logger.error("Gemini chat error:", error);
    const fallback = getFallbackResponse(languageHint as "en" | "es" | undefined);
    return { reply: fallback, detectedLanguage: (languageHint as "en" | "es") ?? "en" };
  }
}

export async function classifyTicket(message: string): Promise<ClassificationResult> {
  try {
    const client = getClient();

    const prompt = `You are a customer support ticket classifier. Analyze the following customer message and classify it.

Message: "${message}"

Respond with ONLY a valid JSON object in this exact format (no markdown, no explanation):
{
  "priority": "low|medium|high|urgent",
  "category": "billing|bug|feature|account|general",
  "sentiment": "positive|neutral|negative",
  "detectedLanguage": "en|es"
}

Classification rules:
- priority: urgent=system down/data loss, high=major functionality broken, medium=partial issue, low=question/minor
- category: billing=payments/invoices, bug=errors/crashes, feature=new functionality requests, account=login/profile/access, general=other
- sentiment: positive=happy/satisfied, negative=angry/frustrated, neutral=factual/calm
- detectedLanguage: en=English, es=Spanish`;

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const rawText = (response.text ?? "").trim();

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in Gemini classification response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    const validPriorities = ["low", "medium", "high", "urgent"];
    const validCategories = ["billing", "bug", "feature", "account", "general"];
    const validSentiments = ["positive", "neutral", "negative"];
    const validLanguages = ["en", "es"];

    const priority = validPriorities.includes(parsed.priority) ? parsed.priority : "medium";
    const category = validCategories.includes(parsed.category) ? parsed.category : "general";
    const sentiment = validSentiments.includes(parsed.sentiment) ? parsed.sentiment : "neutral";
    const detectedLanguage = validLanguages.includes(parsed.detectedLanguage)
      ? parsed.detectedLanguage
      : "en";

    return {
      priority: priority as ClassificationResult["priority"],
      category: category as ClassificationResult["category"],
      sentiment: sentiment as ClassificationResult["sentiment"],
      detectedLanguage: detectedLanguage as ClassificationResult["detectedLanguage"],
    };
  } catch (error) {
    logger.error("Gemini classification error:", error);
    return getFallbackClassification();
  }
}

export async function detectLanguage(text: string): Promise<"en" | "es"> {
  try {
    const client = getClient();

    const prompt = `Detect the language of the following text. Respond with ONLY "en" for English or "es" for Spanish. Nothing else.

Text: "${text}"`;

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const result = (response.text ?? "").trim().toLowerCase();

    if (result === "es") return "es";
    return "en";
  } catch (error) {
    logger.error("Gemini language detection error:", error);
    return "en";
  }
}

export async function checkGeminiConnection(): Promise<boolean> {
  try {
    const client = getClient();

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Reply with the single word: ok",
    });

    const text = (response.text ?? "").trim().toLowerCase();
    return text.includes("ok");
  } catch (error) {
    logger.error("Gemini connection check failed:", error);
    return false;
  }
}

export function clearSessionHistory(sessionId: string): void {
  sessionHistories.delete(sessionId);
}

export function getSessionHistory(sessionId: string): ChatMessage[] {
  return sessionHistories.get(sessionId) ?? [];
}