import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { getDatabase } from "../db/database";
import { classifyTicket } from "../services/classificationService";
import { generateAutoResponse } from "../services/chatService";
import {
  CreateTicketRequestSchema,
  UpdateTicketRequestSchema,
  GetTicketsQuerySchema,
} from "../schemas/ticketSchemas";
import { Ticket } from "../types/index";

const router = Router();

// POST /api/tickets
router.post("/", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = CreateTicketRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request body", details: parsed.error.errors });
      return;
    }

    const { sessionId, message, language, userEmail } = parsed.data;

    const classification = await classifyTicket(message, language ?? "en");

    const ticketId = uuidv4();
    const now = new Date().toISOString();

    let autoResponse = "";
    try {
      autoResponse = await generateAutoResponse(sessionId, message, language ?? "en");
    } catch {
      autoResponse = language === "es"
        ? "Gracias por contactarnos. Un agente revisará su solicitud pronto."
        : "Thank you for reaching out. An agent will review your request shortly.";
    }

    const db = getDatabase();
    db.prepare(`
      INSERT INTO tickets (
        ticketId, sessionId, message, priority, category, sentiment,
        status, language, userEmail, autoResponse, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      ticketId,
      sessionId,
      message,
      classification.priority,
      classification.category,
      classification.sentiment,
      "open",
      language ?? "en",
      userEmail ?? null,
      autoResponse,
      now,
      now
    );

    res.status(201).json({
      ticketId,
      priority: classification.priority,
      category: classification.category,
      sentiment: classification.sentiment,
      status: "open",
      createdAt: now,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/tickets
router.get("/", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = GetTicketsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid query parameters", details: parsed.error.errors });
      return;
    }

    const { status, priority, category, page = 1, limit = 20 } = parsed.data;

    const db = getDatabase();
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (status) {
      conditions.push("status = ?");
      params.push(status);
    }
    if (priority) {
      conditions.push("priority = ?");
      params.push(priority);
    }
    if (category) {
      conditions.push("category = ?");
      params.push(category);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const offset = (page - 1) * limit;

    const countRow = db.prepare(`SELECT COUNT(*) as count FROM tickets ${whereClause}`).get(...params) as { count: number };
    const total = countRow.count;

    const tickets = db.prepare(`
      SELECT ticketId, message, priority, category, sentiment, status, language, createdAt, updatedAt
      FROM tickets
      ${whereClause}
      ORDER BY createdAt DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset) as Ticket[];

    res.status(200).json({
      tickets,
      total,
      page,
      limit,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/tickets/:ticketId
router.get("/:ticketId", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { ticketId } = req.params;

    if (!ticketId || typeof ticketId !== "string") {
      res.status(400).json({ error: "Invalid ticketId" });
      return;
    }

    const db = getDatabase();
    const ticket = db.prepare(`
      SELECT ticketId, message, priority, category, sentiment, status, language, autoResponse, createdAt, updatedAt
      FROM tickets
      WHERE ticketId = ?
    `).get(ticketId) as Ticket | undefined;

    if (!ticket) {
      res.status(404).json({ error: "Ticket not found" });
      return;
    }

    res.status(200).json(ticket);
  } catch (err) {
    next(err);
  }
});

// PUT /api/tickets/:ticketId
router.put("/:ticketId", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { ticketId } = req.params;

    if (!ticketId || typeof ticketId !== "string") {
      res.status(400).json({ error: "Invalid ticketId" });
      return;
    }

    const parsed = UpdateTicketRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request body", details: parsed.error.errors });
      return;
    }

    const { status, priority, notes } = parsed.data;

    const db = getDatabase();
    const existing = db.prepare("SELECT ticketId FROM tickets WHERE ticketId = ?").get(ticketId);
    if (!existing) {
      res.status(404).json({ error: "Ticket not found" });
      return;
    }

    const now = new Date().toISOString();
    const updates: string[] = [];
    const params: (string | number)[] = [];

    if (status !== undefined) {
      updates.push("status = ?");
      params.push(status);
    }
    if (priority !== undefined) {
      updates.push("priority = ?");
      params.push(priority);
    }
    if (notes !== undefined) {
      updates.push("notes = ?");
      params.push(notes);
    }

    updates.push("updatedAt = ?");
    params.push(now);
    params.push(ticketId);

    if (updates.length === 1) {
      // Only updatedAt was added, nothing meaningful to update
      res.status(400).json({ error: "No fields to update" });
      return;
    }

    db.prepare(`UPDATE tickets SET ${updates.join(", ")} WHERE ticketId = ?`).run(...params);

    const updated = db.prepare("SELECT ticketId, status, updatedAt FROM tickets WHERE ticketId = ?").get(ticketId) as {
      ticketId: string;
      status: string;
      updatedAt: string;
    };

    res.status(200).json({
      ticketId: updated.ticketId,
      status: updated.status,
      updatedAt: updated.updatedAt,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/tickets/:ticketId/classify
router.post("/:ticketId/classify", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { ticketId } = req.params;

    if (!ticketId || typeof ticketId !== "string") {
      res.status(400).json({ error: "Invalid ticketId" });
      return;
    }

    const db = getDatabase();
    const ticket = db.prepare("SELECT ticketId, message, language FROM tickets WHERE ticketId = ?").get(ticketId) as {
      ticketId: string;
      message: string;
      language: string;
    } | undefined;

    if (!ticket) {
      res.status(404).json({ error: "Ticket not found" });
      return;
    }

    const classification = await classifyTicket(ticket.message, ticket.language ?? "en");
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE tickets SET priority = ?, category = ?, sentiment = ?, updatedAt = ? WHERE ticketId = ?
    `).run(classification.priority, classification.category, classification.sentiment, now, ticketId);

    res.status(200).json({
      ticketId,
      priority: classification.priority,
      category: classification.category,
      sentiment: classification.sentiment,
    });
  } catch (err) {
    next(err);
  }
});

export default router;