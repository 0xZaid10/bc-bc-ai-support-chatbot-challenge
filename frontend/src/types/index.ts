export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  language?: string;
}

export interface ChatSession {
  sessionId: string;
  messages: ChatMessage[];
  language: string;
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

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketStatus = 'open' | 'in-progress' | 'resolved' | 'closed';
export type TicketSentiment = 'positive' | 'neutral' | 'negative';
export type TicketLanguage = 'en' | 'es';

export interface Ticket {
  ticketId: string;
  message: string;
  priority: TicketPriority;
  category: string;
  sentiment: TicketSentiment;
  status: TicketStatus;
  language: TicketLanguage;
  autoResponse?: string;
  userEmail?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketRequest {
  sessionId: string;
  message: string;
  language: string;
  userEmail?: string;
}

export interface CreateTicketResponse {
  ticketId: string;
  priority: TicketPriority;
  category: string;
  sentiment: TicketSentiment;
  status: TicketStatus;
  createdAt: string;
}

export interface TicketsListResponse {
  tickets: Ticket[];
  total: number;
  page: number;
  limit: number;
}

export interface TicketFilters {
  status?: TicketStatus | '';
  priority?: TicketPriority | '';
  category?: string;
  page?: number;
  limit?: number;
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

export interface ClassifyTicketResponse {
  ticketId: string;
  priority: TicketPriority;
  category: string;
  sentiment: TicketSentiment;
}

export interface TicketsByPriority {
  low: number;
  medium: number;
  high: number;
  urgent: number;
}

export interface TicketsBySentiment {
  positive: number;
  neutral: number;
  negative: number;
}

export interface TicketsByLanguage {
  en: number;
  es: number;
}

export interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  avgResponseTimeMs: number;
  ticketsByPriority: TicketsByPriority;
  ticketsByCategory: Record<string, number>;
  ticketsBySentiment: TicketsBySentiment;
  ticketsByLanguage: TicketsByLanguage;
}

export interface HelpdeskSyncResponse {
  synced: number;
  failed: number;
  lastSyncAt: string;
}

export interface HealthCheckResponse {
  status: string;
  timestamp: string;
  geminiConnected: boolean;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export type SupportedLanguage = 'en' | 'es';

export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

export interface PriorityChartData {
  name: string;
  count: number;
  fill: string;
}

export interface SentimentChartData {
  name: string;
  value: number;
  fill: string;
}

export interface LanguageChartData {
  name: string;
  value: number;
  fill: string;
}