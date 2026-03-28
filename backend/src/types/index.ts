export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export interface ChatSession {
  sessionId: string;
  history: ChatMessage[];
  language: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessageRequest {
  sessionId: string;
  message: string;
  language?: string;
}

export interface ChatMessageResponse {
  sessionId: string;
  reply: string;
  detectedLanguage: string;
  ticketId?: string;
}

export interface Ticket {
  ticketId: string;
  sessionId: string;
  message: string;
  priority: TicketPriority;
  category: TicketCategory;
  sentiment: TicketSentiment;
  status: TicketStatus;
  language: string;
  userEmail?: string;
  autoResponse?: string;
  notes?: string;
  responseTimeMs?: number;
  createdAt: string;
  updatedAt: string;
}

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketCategory = 'billing' | 'bug' | 'feature' | 'account' | 'general';
export type TicketSentiment = 'positive' | 'neutral' | 'negative';
export type TicketStatus = 'open' | 'in-progress' | 'resolved' | 'closed';

export interface CreateTicketRequest {
  sessionId: string;
  message: string;
  language: string;
  userEmail?: string;
}

export interface CreateTicketResponse {
  ticketId: string;
  priority: TicketPriority;
  category: TicketCategory;
  sentiment: TicketSentiment;
  status: TicketStatus;
  createdAt: string;
}

export interface GetTicketsQuery {
  status?: string;
  priority?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export interface GetTicketsResponse {
  tickets: Ticket[];
  total: number;
  page: number;
  limit: number;
}

export interface UpdateTicketRequest {
  status?: TicketStatus;
  priority?: TicketPriority;
  notes?: string;
}

export interface UpdateTicketResponse {
  ticketId: string;
  status: TicketStatus;
  updatedAt: string;
}

export interface ClassificationResult {
  priority: TicketPriority;
  category: TicketCategory;
  sentiment: TicketSentiment;
}

export interface ClassifyTicketResponse {
  ticketId: string;
  priority: TicketPriority;
  category: TicketCategory;
  sentiment: TicketSentiment;
}

export interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  avgResponseTimeMs: number;
  ticketsByPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  ticketsByCategory: Record<string, number>;
  ticketsBySentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  ticketsByLanguage: {
    en: number;
    es: number;
  };
}

export interface HelpdeskSyncResult {
  synced: number;
  failed: number;
  lastSyncAt: string;
}

export interface ExternalHelpdeskTicket {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  category?: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HealthCheckResponse {
  status: string;
  timestamp: string;
  geminiConnected: boolean;
}

export interface GeminiChatRequest {
  sessionId: string;
  message: string;
  history: ChatMessage[];
  language?: string;
}

export interface GeminiChatResponse {
  reply: string;
  detectedLanguage: string;
}

export interface DatabaseTicketRow {
  ticket_id: string;
  session_id: string;
  message: string;
  priority: string;
  category: string;
  sentiment: string;
  status: string;
  language: string;
  user_email: string | null;
  auto_response: string | null;
  notes: string | null;
  response_time_ms: number | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseSessionRow {
  session_id: string;
  history: string;
  language: string;
  created_at: string;
  updated_at: string;
}

export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}