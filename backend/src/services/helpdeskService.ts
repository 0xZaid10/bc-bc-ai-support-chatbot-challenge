import axios, { AxiosInstance } from "axios";
import { v4 as uuidv4 } from "uuid";
import { getDatabase } from "../db/database";
import logger from "../utils/logger";

interface ExternalTicket {
  id: string | number;
  subject?: string;
  description?: string;
  body?: string;
  message?: string;
  status?: string;
  priority?: string;
  category?: string;
  tags?: string[];
  requester_email?: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
  language?: string;
}

interface SyncResult {
  synced: number;
  failed: number;
  lastSyncAt: string;
}

interface NormalizedTicket {
  externalId: string;
  message: string;
  status: string;
  priority: string;
  category: string;
  language: string;
  userEmail: string;
  createdAt: string;
  updatedAt: string;
}

function createHelpdeskClient(): AxiosInstance {
  const baseURL = process.env.HELPDESK_API_URL ?? "https://api.helpdesk.example.com";
  const apiKey = process.env.HELPDESK_API_KEY ?? "";

  return axios.create({
    baseURL,
    timeout: 15000,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });
}

function normalizeExternalTicket(external: ExternalTicket): NormalizedTicket {
  const message =
    external.description ??
    external.body ??
    external.message ??
    external.subject ??
    "No message provided";

  const rawStatus = (external.status ?? "open").toLowerCase();
  const statusMap: Record<string, string> = {
    open: "open",
    new: "open",
    pending: "in-progress",
    "in-progress": "in-progress",
    solved: "resolved",
    closed: "resolved",
    resolved: "resolved",
  };
  const status = statusMap[rawStatus] ?? "open";

  const rawPriority = (external.priority ?? "medium").toLowerCase();
  const priorityMap: Record<string, string> = {
    low: "low",
    normal: "medium",
    medium: "medium",
    high: "high",
    urgent: "urgent",
    critical: "urgent",
  };
  const priority = priorityMap[rawPriority] ?? "medium";

  const rawCategory = (external.category ?? "").toLowerCase();
  const validCategories = ["billing", "bug", "feature", "account", "general"];
  const category = validCategories.includes(rawCategory) ? rawCategory : "general";

  const language = (external.language ?? "en").toLowerCase().startsWith("es") ? "es" : "en";

  const userEmail = external.requester_email ?? external.email ?? "";

  const createdAt = external.created_at ?? new Date().toISOString();
  const updatedAt = external.updated_at ?? new Date().toISOString();

  return {
    externalId: String(external.id),
    message,
    status,
    priority,
    category,
    language,
    userEmail,
    createdAt,
    updatedAt,
  };
}

async function fetchExternalTickets(client: AxiosInstance): Promise<ExternalTicket[]> {
  try {
    const response = await client.get<ExternalTicket[] | { tickets: ExternalTicket[]; data: ExternalTicket[] }>("/tickets", {
      params: {
        per_page: 100,
        page: 1,
      },
    });

    const data = response.data;

    if (Array.isArray(data)) {
      return data;
    }

    if (data && typeof data === "object") {
      const obj = data as Record<string, unknown>;
      if (Array.isArray(obj["tickets"])) {
        return obj["tickets"] as ExternalTicket[];
      }
      if (Array.isArray(obj["data"])) {
        return obj["data"] as ExternalTicket[];
      }
    }

    logger.warn("Unexpected response shape from helpdesk API, returning empty array");
    return [];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.message;
      logger.error(`Helpdesk API request failed: status=${status}, message=${message}`);

      if (status === 401 || status === 403) {
        throw new Error("Helpdesk API authentication failed. Check HELPDESK_API_KEY.");
      }
      if (status === 404) {
        throw new Error("Helpdesk API endpoint not found. Check HELPDESK_API_URL.");
      }
      if (status !== undefined && status >= 500) {
        throw new Error("Helpdesk API server error. Please try again later.");
      }
    }
    throw error;
  }
}

function upsertTicket(normalized: NormalizedTicket): boolean {
  const db = getDatabase();

  try {
    const existing = db
      .prepare("SELECT ticket_id FROM tickets WHERE external_id = ?")
      .get(normalized.externalId) as { ticket_id: string } | undefined;

    if (existing) {
      db.prepare(
        `UPDATE tickets
         SET status = ?, priority = ?, category = ?, updated_at = ?
         WHERE external_id = ?`
      ).run(
        normalized.status,
        normalized.priority,
        normalized.category,
        normalized.updatedAt,
        normalized.externalId
      );
      logger.debug(`Updated existing ticket with external_id=${normalized.externalId}`);
    } else {
      const ticketId = uuidv4();
      const now = new Date().toISOString();

      db.prepare(
        `INSERT INTO tickets (
          ticket_id, session_id, message, priority, category, sentiment,
          status, language, user_email, auto_response, external_id,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        ticketId,
        `helpdesk-sync-${normalized.externalId}`,
        normalized.message,
        normalized.priority,
        normalized.category,
        "neutral",
        normalized.status,
        normalized.language,
        normalized.userEmail,
        "",
        normalized.externalId,
        normalized.createdAt,
        now
      );
      logger.debug(`Inserted new ticket with external_id=${normalized.externalId}, ticket_id=${ticketId}`);
    }

    return true;
  } catch (error) {
    logger.error(`Failed to upsert ticket with external_id=${normalized.externalId}: ${String(error)}`);
    return false;
  }
}

export async function syncHelpdeskTickets(): Promise<SyncResult> {
  const lastSyncAt = new Date().toISOString();
  let synced = 0;
  let failed = 0;

  const helpdeskApiUrl = process.env.HELPDESK_API_URL;
  if (!helpdeskApiUrl) {
    logger.warn("HELPDESK_API_URL is not set. Returning empty sync result.");
    return { synced: 0, failed: 0, lastSyncAt };
  }

  const client = createHelpdeskClient();

  let externalTickets: ExternalTicket[];
  try {
    externalTickets = await fetchExternalTickets(client);
    logger.info(`Fetched ${externalTickets.length} tickets from helpdesk API`);
  } catch (error) {
    logger.error(`Failed to fetch tickets from helpdesk: ${String(error)}`);
    throw error;
  }

  for (const external of externalTickets) {
    try {
      if (!external.id) {
        logger.warn("Skipping external ticket with missing id");
        failed++;
        continue;
      }

      const normalized = normalizeExternalTicket(external);
      const success = upsertTicket(normalized);

      if (success) {
        synced++;
      } else {
        failed++;
      }
    } catch (error) {
      logger.error(`Error processing external ticket id=${external.id}: ${String(error)}`);
      failed++;
    }
  }

  logger.info(`Helpdesk sync complete: synced=${synced}, failed=${failed}`);

  return { synced, failed, lastSyncAt };
}