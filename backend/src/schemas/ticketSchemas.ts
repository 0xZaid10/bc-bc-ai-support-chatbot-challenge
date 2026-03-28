import { z } from "zod";

export const createTicketSchema = z.object({
  body: z.object({
    sessionId: z.string().min(1, "sessionId is required"),
    message: z.string().min(1, "message is required"),
    language: z.string().optional().default("en"),
    userEmail: z.string().email("Invalid email format").optional(),
  }),
});

export const getTicketsQuerySchema = z.object({
  query: z.object({
    status: z
      .enum(["open", "in-progress", "resolved", "closed"])
      .optional(),
    priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
    category: z
      .enum(["billing", "bug", "feature", "account", "general"])
      .optional(),
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1))
      .pipe(z.number().int().positive().default(1)),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 20))
      .pipe(z.number().int().positive().max(100).default(20)),
  }),
});

export const getTicketByIdSchema = z.object({
  params: z.object({
    ticketId: z.string().min(1, "ticketId is required"),
  }),
});

export const updateTicketSchema = z.object({
  params: z.object({
    ticketId: z.string().min(1, "ticketId is required"),
  }),
  body: z.object({
    status: z
      .enum(["open", "in-progress", "resolved", "closed"])
      .optional(),
    priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
    notes: z.string().optional(),
  }),
});

export const classifyTicketSchema = z.object({
  params: z.object({
    ticketId: z.string().min(1, "ticketId is required"),
  }),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>["body"];
export type GetTicketsQuery = z.infer<typeof getTicketsQuerySchema>["query"];
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>["body"];