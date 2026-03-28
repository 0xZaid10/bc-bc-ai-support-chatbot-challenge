import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { initializeDatabase, getDatabase } from '../src/db/database';
import { runMigrations } from '../src/db/migrations';
import dashboardRouter from '../src/routes/dashboard';
import { errorHandler } from '../src/middleware/errorHandler';

jest.mock('../src/services/geminiService');

const createTestApp = (): express.Application => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/dashboard', dashboardRouter);
  app.use(errorHandler);
  return app;
};

const seedTickets = (): void => {
  const db = getDatabase();

  const tickets = [
    {
      ticket_id: 'test-ticket-001',
      session_id: 'session-001',
      message: 'I cannot login to my account',
      priority: 'high',
      category: 'account',
      sentiment: 'negative',
      status: 'open',
      language: 'en',
      user_email: 'user1@example.com',
      auto_response: 'We are looking into your account issue.',
      notes: null,
      response_time_ms: 1200,
      created_at: new Date(Date.now() - 3600000).toISOString(),
      updated_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      ticket_id: 'test-ticket-002',
      session_id: 'session-002',
      message: 'My bill is incorrect this month',
      priority: 'medium',
      category: 'billing',
      sentiment: 'negative',
      status: 'open',
      language: 'en',
      user_email: 'user2@example.com',
      auto_response: 'We will review your billing issue.',
      notes: null,
      response_time_ms: 800,
      created_at: new Date(Date.now() - 7200000).toISOString(),
      updated_at: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      ticket_id: 'test-ticket-003',
      session_id: 'session-003',
      message: 'La aplicación no funciona correctamente',
      priority: 'urgent',
      category: 'bug',
      sentiment: 'negative',
      status: 'in-progress',
      language: 'es',
      user_email: 'user3@example.com',
      auto_response: 'Estamos investigando el problema.',
      notes: null,
      response_time_ms: 500,
      created_at: new Date(Date.now() - 10800000).toISOString(),
      updated_at: new Date(Date.now() - 10800000).toISOString(),
    },
    {
      ticket_id: 'test-ticket-004',
      session_id: 'session-004',
      message: 'Please add dark mode feature',
      priority: 'low',
      category: 'feature',
      sentiment: 'positive',
      status: 'resolved',
      language: 'en',
      user_email: 'user4@example.com',
      auto_response: 'Thank you for your feature request.',
      notes: 'Forwarded to product team',
      response_time_ms: 2000,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 43200000).toISOString(),
    },
    {
      ticket_id: 'test-ticket-005',
      session_id: 'session-005',
      message: 'Everything is working great, just a question',
      priority: 'low',
      category: 'account',
      sentiment: 'positive',
      status: 'resolved',
      language: 'en',
      user_email: 'user5@example.com',
      auto_response: 'Happy to help with your question.',
      notes: null,
      response_time_ms: 300,
      created_at: new Date(Date.now() - 172800000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      ticket_id: 'test-ticket-006',
      session_id: 'session-006',
      message: 'Necesito ayuda con mi factura',
      priority: 'medium',
      category: 'billing',
      sentiment: 'neutral',
      status: 'open',
      language: 'es',
      user_email: 'user6@example.com',
      auto_response: 'Le ayudaremos con su factura.',
      notes: null,
      response_time_ms: 1500,
      created_at: new Date(Date.now() - 14400000).toISOString(),
      updated_at: new Date(Date.now() - 14400000).toISOString(),
    },
  ];

  const insert = db.prepare(`
    INSERT OR REPLACE INTO tickets (
      ticket_id, session_id, message, priority, category, sentiment,
      status, language, user_email, auto_response, notes,
      response_time_ms, created_at, updated_at
    ) VALUES (
      @ticket_id, @session_id, @message, @priority, @category, @sentiment,
      @status, @language, @user_email, @auto_response, @notes,
      @response_time_ms, @created_at, @updated_at
    )
  `);

  const insertMany = db.transaction((rows: typeof tickets) => {
    for (const row of rows) {
      insert.run(row);
    }
  });

  insertMany(tickets);
};

const clearTickets = (): void => {
  const db = getDatabase();
  db.prepare('DELETE FROM tickets WHERE ticket_id LIKE ?').run('test-ticket-%');
};

describe('GET /api/dashboard/stats', () => {
  let app: express.Application;

  beforeAll(() => {
    initializeDatabase(':memory:');
    runMigrations();
    app = createTestApp();
  });

  beforeEach(() => {
    clearTickets();
    seedTickets();
  });

  afterAll(() => {
    clearTickets();
  });

  it('should return 200 with valid stats structure', async () => {
    const response = await request(app).get('/api/dashboard/stats');

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
  });

  it('should return correct total ticket count', async () => {
    const response = await request(app).get('/api/dashboard/stats');

    expect(response.status).toBe(200);
    expect(response.body.totalTickets).toBe(6);
  });

  it('should return correct open ticket count', async () => {
    const response = await request(app).get('/api/dashboard/stats');

    expect(response.status).toBe(200);
    expect(response.body.openTickets).toBe(3);
  });

  it('should return correct resolved ticket count', async () => {
    const response = await request(app).get('/api/dashboard/stats');

    expect(response.status).toBe(200);
    expect(response.body.resolvedTickets).toBe(2);
  });

  it('should return avgResponseTimeMs as a number', async () => {
    const response = await request(app).get('/api/dashboard/stats');

    expect(response.status).toBe(200);
    expect(typeof response.body.avgResponseTimeMs).toBe('number');
    expect(response.body.avgResponseTimeMs).toBeGreaterThan(0);
  });

  it('should return correct average response time', async () => {
    const response = await request(app).get('/api/dashboard/stats');

    const expectedAvg = (1200 + 800 + 500 + 2000 + 300 + 1500) / 6;
    expect(response.body.avgResponseTimeMs).toBeCloseTo(expectedAvg, 0);
  });

  it('should return ticketsByPriority with correct counts', async () => {
    const response = await request(app).get('/api/dashboard/stats');

    expect(response.status).toBe(200);
    expect(response.body.ticketsByPriority).toBeDefined();
    expect(response.body.ticketsByPriority.low).toBe(2);
    expect(response.body.ticketsByPriority.medium).toBe(2);
    expect(response.body.ticketsByPriority.high).toBe(1);
    expect(response.body.ticketsByPriority.urgent).toBe(1);
  });

  it('should return ticketsByPriority with all priority keys', async () => {
    const response = await request(app).get('/api/dashboard/stats');

    expect(response.body.ticketsByPriority).toHaveProperty('low');
    expect(response.body.ticketsByPriority).toHaveProperty('medium');
    expect(response.body.ticketsByPriority).toHaveProperty('high');
    expect(response.body.ticketsByPriority).toHaveProperty('urgent');
  });

  it('should return ticketsByCategory with correct counts', async () => {
    const response = await request(app).get('/api/dashboard/stats');

    expect(response.status).toBe(200);
    expect(response.body.ticketsByCategory).toBeDefined();
    expect(response.body.ticketsByCategory.billing).toBe(2);
    expect(response.body.ticketsByCategory.account).toBe(2);
    expect(response.body.ticketsByCategory.bug).toBe(1);
    expect(response.body.ticketsByCategory.feature).toBe(1);
  });

  it('should return ticketsBySentiment with correct counts', async () => {
    const response = await request(app).get('/api/dashboard/stats');

    expect(response.status).toBe(200);
    expect(response.body.ticketsBySentiment).toBeDefined();
    expect(response.body.ticketsBySentiment.negative).toBe(3);
    expect(response.body.ticketsBySentiment.positive).toBe(2);
    expect(response.body.ticketsBySentiment.neutral).toBe(1);
  });

  it('should return ticketsBySentiment with all sentiment keys', async () => {
    const response = await request(app).get('/api/dashboard/stats');

    expect(response.body.ticketsBySentiment).toHaveProperty('positive');
    expect(response.body.ticketsBySentiment).toHaveProperty('neutral');
    expect(response.body.ticketsBySentiment).toHaveProperty('negative');
  });

  it('should return ticketsByLanguage with correct counts', async () => {
    const response = await request(app).get('/api/dashboard/stats');

    expect(response.status).toBe(200);
    expect(response.body.ticketsByLanguage).toBeDefined();
    expect(response.body.ticketsByLanguage.en).toBe(4);
    expect(response.body.ticketsByLanguage.es).toBe(2);
  });

  it('should return ticketsByLanguage with en and es keys', async () => {
    const response = await request(app).get('/api/dashboard/stats');

    expect(response.body.ticketsByLanguage).toHaveProperty('en');
    expect(response.body.ticketsByLanguage).toHaveProperty('es');
  });

  it('should return zero counts when no tickets exist', async () => {
    clearTickets();

    const response = await request(app).get('/api/dashboard/stats');

    expect(response.status).toBe(200);
    expect(response.body.totalTickets).toBe(0);
    expect(response.body.openTickets).toBe(0);
    expect(response.body.resolvedTickets).toBe(0);
    expect(response.body.avgResponseTimeMs).toBe(0);
    expect(response.body.ticketsByPriority.low).toBe(0);
    expect(response.body.ticketsByPriority.medium).toBe(0);
    expect(response.body.ticketsByPriority.high).toBe(0);
    expect(response.body.ticketsByPriority.urgent).toBe(0);
    expect(response.body.ticketsBySentiment.positive).toBe(0);
    expect(response.body.ticketsBySentiment.neutral).toBe(0);
    expect(response.body.ticketsBySentiment.negative).toBe(0);
    expect(response.body.ticketsByLanguage.en).toBe(0);
    expect(response.body.ticketsByLanguage.es).toBe(0);
  });

  it('should have numeric values for all count fields', async () => {
    const response = await request(app).get('/api/dashboard/stats');

    expect(typeof response.body.totalTickets).toBe('number');
    expect(typeof response.body.openTickets).toBe('number');
    expect(typeof response.body.resolvedTickets).toBe('number');
    expect(typeof response.body.avgResponseTimeMs).toBe('number');
  });

  it('should have ticketsByCategory as an object', async () => {
    const response = await request(app).get('/api/dashboard/stats');

    expect(typeof response.body.ticketsByCategory).toBe('object');
    expect(response.body.ticketsByCategory).not.toBeNull();
    expect(Array.isArray(response.body.ticketsByCategory)).toBe(false);
  });

  it('should reflect updated stats after adding new tickets', async () => {
    const db = getDatabase();
    db.prepare(`
      INSERT INTO tickets (
        ticket_id, session_id, message, priority, category, sentiment,
        status, language, user_email, auto_response, notes,
        response_time_ms, created_at, updated_at
      ) VALUES (
        'test-ticket-007', 'session-007', 'New urgent bug report', 'urgent', 'bug', 'negative',
        'open', 'en', 'user7@example.com', 'We are on it.', NULL,
        600, ?, ?
      )
    `).run(new Date().toISOString(), new Date().toISOString());

    const response = await request(app).get('/api/dashboard/stats');

    expect(response.status).toBe(200);
    expect(response.body.totalTickets).toBe(7);
    expect(response.body.openTickets).toBe(4);
    expect(response.body.ticketsByPriority.urgent).toBe(2);
    expect(response.body.ticketsByCategory.bug).toBe(2);
    expect(response.body.ticketsBySentiment.negative).toBe(4);

    db.prepare('DELETE FROM tickets WHERE ticket_id = ?').run('test-ticket-007');
  });

  it('should correctly count in-progress tickets separately from open and resolved', async () => {
    const response = await request(app).get('/api/dashboard/stats');

    expect(response.status).toBe(200);
    const inProgressCount = response.body.totalTickets - response.body.openTickets - response.body.resolvedTickets;
    expect(inProgressCount).toBe(1);
  });
});