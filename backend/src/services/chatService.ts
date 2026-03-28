import { v4 as uuidv4 } from "uuid";
import { getDatabase } from "../db/database";
import { generateChatResponse } from "./geminiService";
import { classifyTicket } from "./classificationService";
import { logger } from "../utils/logger";
import { getFallbackChatResponse } from "../utils/fallback";

interface ConversationMessage {
  role: "user" | "model";
  content: string;
}

interface ChatMessageResult {
  sessionId: string;
  reply: string;
  detectedLanguage: string;
  ticketId?: string;
}

interface SessionData {
  history: ConversationMessage[];
  language: string;
  createdAt: number;
}

const sessionStore = new Map<string, SessionData>();

const SESSION_TTL_MS = 30 * 60 * 1000;

function cleanExpiredSessions(): void {
  const now = Date.now();
  for (const [sessionId, session] of sessionStore.entries()) {
    if (now - session.createdAt > SESSION_TTL_MS) {
      sessionStore.delete(sessionId);
    }
  }
}

function getOrCreateSession(sessionId: string, language?: string): SessionData {
  cleanExpiredSessions();

  if (!sessionStore.has(sessionId)) {
    sessionStore.set(sessionId, {
      history: [],
      language: language ?? "en",
      createdAt: Date.now(),
    });
  }

  const session = sessionStore.get(sessionId)!;

  if (language && language !== session.language) {
    session.language = language;
  }

  return session;
}

function persistMessageToDb(
  sessionId: string,
  role: "user" | "model",
  content: string,
  detectedLanguage: string
): void {
  try {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO chat_messages (id, session_id, role, content, language, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(uuidv4(), sessionId, role, content, detectedLanguage, new Date().toISOString());
  } catch (err) {
    logger.error("Failed to persist chat message to DB", { sessionId, role, error: err });
  }
}

function shouldCreateTicket(message: string): boolean {
  const ticketTriggerPhrases = [
    "create ticket",
    "open ticket",
    "submit ticket",
    "report issue",
    "report problem",
    "crear ticket",
    "abrir ticket",
    "reportar problema",
    "reportar error",
    "necesito ayuda urgente",
    "i need urgent help",
    "this is urgent",
    "please escalate",
    "escalar",
  ];

  const lowerMessage = message.toLowerCase();
  return ticketTriggerPhrases.some((phrase) => lowerMessage.includes(phrase));
}

async function createTicketFromSession(
  sessionId: string,
  message: string,
  language: string,
  userEmail?: string
): Promise<string | undefined> {
  try {
    const db = getDatabase();
    const ticketId = uuidv4();
    const now = new Date().toISOString();

    const classification = await classifyTicket(message, language);

    const stmt = db.prepare(`
      INSERT INTO tickets (
        id, session_id, message, priority, category, sentiment,
        status, language, user_email, auto_response, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      ticketId,
      sessionId,
      message,
      classification.priority,
      classification.category,
      classification.sentiment,
      "open",
      language,
      userEmail ?? null,
      classification.autoResponse ?? null,
      null,
      now,
      now
    );

    logger.info("Ticket created from chat session", { ticketId, sessionId, classification });

    return ticketId;
  } catch (err) {
    logger.error("Failed to create ticket from session", { sessionId, error: err });
    return undefined;
  }
}

export async function processChatMessage(
  sessionId: string,
  message: string,
  language?: string
): Promise<ChatMessageResult> {
  const session = getOrCreateSession(sessionId, language);

  session.history.push({
    role: "user",
    content: message,
  });

  persistMessageToDb(sessionId, "user", message, session.language);

  let reply: string;
  let detectedLanguage: string = session.language;

  try {
    const result = await generateChatResponse(message, session.history, session.language);
    reply = result.reply;
    detectedLanguage = result.detectedLanguage;
    session.language = detectedLanguage;
  } catch (err) {
    logger.error("Gemini chat response failed, using fallback", { sessionId, error: err });
    reply = getFallbackChatResponse(session.language);
    detectedLanguage = session.language;
  }

  session.history.push({
    role: "model",
    content: reply,
  });

  persistMessageToDb(sessionId, "model", reply, detectedLanguage);

  let ticketId: string | undefined;

  if (shouldCreateTicket(message)) {
    ticketId = await createTicketFromSession(sessionId, message, detectedLanguage);
  }

  return {
    sessionId,
    reply,
    detectedLanguage,
    ticketId,
  };
}

export function getSessionHistory(sessionId: string): ConversationMessage[] {
  const session = sessionStore.get(sessionId);
  return session ? [...session.history] : [];
}

export function clearSession(sessionId: string): void {
  sessionStore.delete(sessionId);
  logger.info("Session cleared", { sessionId });
}

export function getActiveSessionCount(): number {
  cleanExpiredSessions();
  return sessionStore.size;
}