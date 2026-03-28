import { GoogleGenAI } from "@google/genai";
import { logger } from "../utils/logger";
import { getFallbackClassification } from "../utils/fallback";

interface ClassificationResult {
  priority: "low" | "medium" | "high" | "urgent";
  category: "billing" | "bug" | "feature" | "account" | "general";
  sentiment: "positive" | "neutral" | "negative";
}

const VALID_PRIORITIES = ["low", "medium", "high", "urgent"] as const;
const VALID_CATEGORIES = ["billing", "bug", "feature", "account", "general"] as const;
const VALID_SENTIMENTS = ["positive", "neutral", "negative"] as const;

function isValidPriority(value: string): value is ClassificationResult["priority"] {
  return VALID_PRIORITIES.includes(value as ClassificationResult["priority"]);
}

function isValidCategory(value: string): value is ClassificationResult["category"] {
  return VALID_CATEGORIES.includes(value as ClassificationResult["category"]);
}

function isValidSentiment(value: string): value is ClassificationResult["sentiment"] {
  return VALID_SENTIMENTS.includes(value as ClassificationResult["sentiment"]);
}

function parseClassificationResponse(text: string): ClassificationResult {
  const cleaned = text.trim();

  let parsed: Record<string, unknown>;
  try {
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON object found in response");
    }
    parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
  } catch (err) {
    logger.error("Failed to parse classification JSON", { text, err });
    return getFallbackClassification();
  }

  const priority = typeof parsed.priority === "string" ? parsed.priority.toLowerCase() : "";
  const category = typeof parsed.category === "string" ? parsed.category.toLowerCase() : "";
  const sentiment = typeof parsed.sentiment === "string" ? parsed.sentiment.toLowerCase() : "";

  return {
    priority: isValidPriority(priority) ? priority : "medium",
    category: isValidCategory(category) ? category : "general",
    sentiment: isValidSentiment(sentiment) ? sentiment : "neutral",
  };
}

export async function classifyTicket(message: string): Promise<ClassificationResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    logger.warn("GEMINI_API_KEY not set — using fallback classification");
    return getFallbackClassification();
  }

  const prompt = `You are a customer support ticket classifier. Analyze the following customer message and classify it.

Customer message: "${message}"

Respond ONLY with a valid JSON object in this exact format (no markdown, no explanation):
{
  "priority": "<low|medium|high|urgent>",
  "category": "<billing|bug|feature|account|general>",
  "sentiment": "<positive|neutral|negative>"
}

Classification rules:
- priority: urgent = system down/data loss/security breach, high = major functionality broken, medium = partial issue/workaround exists, low = question/minor issue/feature request
- category: billing = payments/invoices/subscriptions, bug = software errors/crashes/unexpected behavior, feature = new feature requests/enhancements, account = login/password/profile/permissions, general = anything else
- sentiment: positive = satisfied/happy/grateful, negative = frustrated/angry/upset, neutral = informational/calm`;

  try {
    const genai = new GoogleGenAI({ apiKey });

    const response = await genai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text ?? "";

    if (!text) {
      logger.warn("Empty response from Gemini classification — using fallback");
      return getFallbackClassification();
    }

    const result = parseClassificationResponse(text);
    logger.info("Ticket classified successfully", { message: message.substring(0, 50), result });
    return result;
  } catch (err) {
    logger.error("Gemini classification failed — using fallback", { err });
    return getFallbackClassification();
  }
}

export async function reclassifyTicket(
  ticketId: string,
  message: string
): Promise<ClassificationResult> {
  logger.info("Re-classifying ticket", { ticketId });
  return classifyTicket(message);
}