import { z } from "zod";

export const helpdeskSyncResponseSchema = z.object({
  synced: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
  lastSyncAt: z.string(),
});

export const externalTicketSchema = z.object({
  id: z.string(),
  subject: z.string().optional().default(""),
  description: z.string().optional().default(""),
  status: z.enum(["open", "in-progress", "resolved", "closed"]).optional().default("open"),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional().default("medium"),
  category: z.string().optional().default("general"),
  email: z.string().email().optional(),
  language: z.enum(["en", "es"]).optional().default("en"),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const externalTicketsListSchema = z.array(externalTicketSchema);

export const helpdeskSyncQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val !== undefined ? parseInt(val, 10) : 1))
    .pipe(z.number().int().positive()),
  limit: z
    .string()
    .optional()
    .transform((val) => (val !== undefined ? parseInt(val, 10) : 100))
    .pipe(z.number().int().positive().max(500)),
});

export type HelpdeskSyncResponse = z.infer<typeof helpdeskSyncResponseSchema>;
export type ExternalTicket = z.infer<typeof externalTicketSchema>;
export type ExternalTicketsList = z.infer<typeof externalTicketsListSchema>;
export type HelpdeskSyncQuery = z.infer<typeof helpdeskSyncQuerySchema>;