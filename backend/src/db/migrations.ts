import { Database } from 'better-sqlite3';

export function runMigrations(db: Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS tickets (
      ticketId TEXT PRIMARY KEY,
      sessionId TEXT,
      message TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'medium',
      category TEXT NOT NULL DEFAULT 'general',
      sentiment TEXT NOT NULL DEFAULT 'neutral',
      status TEXT NOT NULL DEFAULT 'open',
      language TEXT NOT NULL DEFAULT 'en',
      autoResponse TEXT,
      userEmail TEXT,
      notes TEXT,
      responseTimeMs INTEGER,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS chat_sessions (
      sessionId TEXT PRIMARY KEY,
      language TEXT NOT NULL DEFAULT 'en',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sessionId TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (sessionId) REFERENCES chat_sessions(sessionId)
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS helpdesk_sync_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      synced INTEGER NOT NULL DEFAULT 0,
      failed INTEGER NOT NULL DEFAULT 0,
      syncedAt TEXT NOT NULL
    );
  `);

  // Indexes for performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_tickets_category ON tickets(category);
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_tickets_language ON tickets(language);
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_tickets_sentiment ON tickets(sentiment);
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_tickets_createdAt ON tickets(createdAt);
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_chat_messages_sessionId ON chat_messages(sessionId);
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_tickets_sessionId ON tickets(sessionId);
  `);
}