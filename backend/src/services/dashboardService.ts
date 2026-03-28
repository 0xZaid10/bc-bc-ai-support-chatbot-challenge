import { getDatabase } from '../db/database';
import { DashboardStats } from '../types/index';

export async function getDashboardStats(): Promise<DashboardStats> {
  const db = getDatabase();

  const totalTickets = (
    db.prepare('SELECT COUNT(*) as count FROM tickets').get() as { count: number }
  ).count;

  const openTickets = (
    db
      .prepare("SELECT COUNT(*) as count FROM tickets WHERE status NOT IN ('resolved', 'closed')")
      .get() as { count: number }
  ).count;

  const resolvedTickets = (
    db
      .prepare("SELECT COUNT(*) as count FROM tickets WHERE status IN ('resolved', 'closed')")
      .get() as { count: number }
  ).count;

  const avgResponseTimeRow = db
    .prepare('SELECT AVG(response_time_ms) as avg FROM tickets WHERE response_time_ms IS NOT NULL')
    .get() as { avg: number | null };
  const avgResponseTimeMs = avgResponseTimeRow.avg ?? 0;

  const priorityRows = db
    .prepare(
      "SELECT priority, COUNT(*) as count FROM tickets GROUP BY priority"
    )
    .all() as { priority: string; count: number }[];

  const ticketsByPriority: DashboardStats['ticketsByPriority'] = {
    low: 0,
    medium: 0,
    high: 0,
    urgent: 0,
  };

  for (const row of priorityRows) {
    const key = row.priority as keyof typeof ticketsByPriority;
    if (key in ticketsByPriority) {
      ticketsByPriority[key] = row.count;
    }
  }

  const categoryRows = db
    .prepare('SELECT category, COUNT(*) as count FROM tickets GROUP BY category')
    .all() as { category: string; count: number }[];

  const ticketsByCategory: Record<string, number> = {};
  for (const row of categoryRows) {
    if (row.category) {
      ticketsByCategory[row.category] = row.count;
    }
  }

  const sentimentRows = db
    .prepare('SELECT sentiment, COUNT(*) as count FROM tickets GROUP BY sentiment')
    .all() as { sentiment: string; count: number }[];

  const ticketsBySentiment: DashboardStats['ticketsBySentiment'] = {
    positive: 0,
    neutral: 0,
    negative: 0,
  };

  for (const row of sentimentRows) {
    const key = row.sentiment as keyof typeof ticketsBySentiment;
    if (key in ticketsBySentiment) {
      ticketsBySentiment[key] = row.count;
    }
  }

  const languageRows = db
    .prepare('SELECT language, COUNT(*) as count FROM tickets GROUP BY language')
    .all() as { language: string; count: number }[];

  const ticketsByLanguage: DashboardStats['ticketsByLanguage'] = {
    en: 0,
    es: 0,
  };

  for (const row of languageRows) {
    const key = row.language as keyof typeof ticketsByLanguage;
    if (key in ticketsByLanguage) {
      ticketsByLanguage[key] = row.count;
    }
  }

  return {
    totalTickets,
    openTickets,
    resolvedTickets,
    avgResponseTimeMs: Math.round(avgResponseTimeMs),
    ticketsByPriority,
    ticketsByCategory,
    ticketsBySentiment,
    ticketsByLanguage,
  };
}