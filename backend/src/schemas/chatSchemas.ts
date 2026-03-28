import { z } from "zod";

export const SendMessageSchema = z.object({
  sessionId: z.string().min(1, "sessionId is required"),
  message: z.string().min(1, "message is required"),
  language: z.enum(["en", "es"]).optional(),
});

export const SendMessageResponseSchema = z.object({
  sessionId: z.string(),
  reply: z.string(),
  detectedLanguage: z.string(),
  ticketId: z.string().optional(),
});

export type SendMessageRequest = z.infer<typeof SendMessageSchema>;
export type SendMessageResponse = z.infer<typeof SendMessageResponseSchema>;