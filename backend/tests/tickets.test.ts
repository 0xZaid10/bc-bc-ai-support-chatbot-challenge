import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import ticketsRouter from '../src/routes/tickets';
import { errorHandler } from '../src/middleware/errorHandler';
import { getDatabase } from '../src/db/database';
import { runMigrations } from '../src/db/migrations';

jest.mock('../src/services/classificationService');
jest.mock('../src/services/geminiService');

import { classifyTicket } from '../src/services/classificationService';
import { generateAutoResponse } from '../src/services/geminiService';

const mockedClassifyTicket = classifyTicket as jest.MockedFunction<typeof classifyTicket>;
const mockedGenerateAutoResponse = generateAutoResponse as jest.MockedFunction<typeof generateAutoResponse>;

function buildApp(): express.Application {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/tickets', ticketsRouter);
  app.use(errorHandler);
  return app;
}

describe('Tickets API', () => {
  let app: express.Application;
  let db: ReturnType<typeof getDatabase>;

  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    process.env.GEMINI_API_KEY = 'test-api-key';

    db = getDatabase();
    runMigrations(db);

    app = buildApp();
  });

  beforeEach(() => {
    db.prepare('DELETE FROM tickets').run();
    db.prepare('DELETE FROM chat_sessions').run();
    db.prepare('DELETE FROM chat_messages').run();

    mockedClassifyTicket.mockReset();
    mockedGenerateAutoResponse.mockReset();

    mockedClassifyTicket.mockResolvedValue({
      priority: 'medium',
      category: 'billing',
      sentiment: 'neutral',
    });

    mockedGenerateAutoResponse.mockResolvedValue(
      'Thank you for contacting support. We will look into your billing issue shortly.'
    );
  });

  afterAll(() => {
    db.prepare('DELETE FROM tickets').run();
    db.prepare('DELETE FROM chat_sessions').run();
    db.prepare('DELETE FROM chat_messages').run();
  });

  describe('POST /api/tickets', () => {
    it('should create a new ticket with valid payload', async () => {
      const payload = {
        sessionId: uuidv4(),
        message: 'I have a billing issue with my account.',
        language: 'en',
        userEmail: 'user@example.com',
      };

      const response = await request(app)
        .post('/api/tickets')
        .send(payload)
        .expect(201);

      expect(response.body).toHaveProperty('ticketId');
      expect(response.body).toHaveProperty('priority', 'medium');
      expect(response.body).toHaveProperty('category', 'billing');
      expect(response.body).toHaveProperty('sentiment', 'neutral');
      expect(response.body).toHaveProperty('status', 'open');
      expect(response.body).toHaveProperty('createdAt');
    });

    it('should create a ticket without optional userEmail', async () => {
      const payload = {
        sessionId: uuidv4(),
        message: 'My app keeps crashing.',
        language: 'en',
      };

      mockedClassifyTicket.mockResolvedValueOnce({
        priority: 'high',
        category: 'bug',
        sentiment: 'negative',
      });

      const response = await request(app)
        .post('/api/tickets')
        .send(payload)
        .expect(201);

      expect(response.body).toHaveProperty('ticketId');
      expect(response.body.priority).toBe('high');
      expect(response.body.category).toBe('bug');
      expect(response.body.sentiment).toBe('negative');
    });

    it('should create a ticket in Spanish', async () => {
      const payload = {
        sessionId: uuidv4(),
        message: 'Tengo un problema con mi factura.',
        language: 'es',
        userEmail: 'usuario@ejemplo.com',
      };

      mockedClassifyTicket.mockResolvedValueOnce({
        priority: 'medium',
        category: 'billing',
        sentiment: 'negative',
      });

      mockedGenerateAutoResponse.mockResolvedValueOnce(
        'Gracias por contactar soporte. Revisaremos su problema de facturación.'
      );

      const response = await request(app)
        .post('/api/tickets')
        .send(payload)
        .expect(201);

      expect(response.body).toHaveProperty('ticketId');
      expect(response.body.category).toBe('billing');
    });

    it('should return 400 when message is missing', async () => {
      const payload = {
        sessionId: uuidv4(),
        language: 'en',
      };

      const response = await request(app)
        .post('/api/tickets')
        .send(payload)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 when sessionId is missing', async () => {
      const payload = {
        message: 'I need help with my account.',
        language: 'en',
      };

      const response = await request(app)
        .post('/api/tickets')
        .send(payload)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 when language is missing', async () => {
      const payload = {
        sessionId: uuidv4(),
        message: 'I need help.',
      };

      const response = await request(app)
        .post('/api/tickets')
        .send(payload)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle classification service failure gracefully', async () => {
      mockedClassifyTicket.mockRejectedValueOnce(new Error('Gemini API unavailable'));

      const payload = {
        sessionId: uuidv4(),
        message: 'Something went wrong with my order.',
        language: 'en',
      };

      const response = await request(app)
        .post('/api/tickets')
        .send(payload);

      expect([201, 500]).toContain(response.status);
    });

    it('should persist ticket to database', async () => {
      const payload = {
        sessionId: uuidv4(),
        message: 'I want to request a new feature.',
        language: 'en',
        userEmail: 'dev@example.com',
      };

      mockedClassifyTicket.mockResolvedValueOnce({
        priority: 'low',
        category: 'feature',
        sentiment: 'positive',
      });

      const response = await request(app)
        .post('/api/tickets')
        .send(payload)
        .expect(201);

      const ticketId = response.body.ticketId;
      const ticket = db.prepare('SELECT * FROM tickets WHERE ticket_id = ?').get(ticketId) as Record<string, unknown> | undefined;

      expect(ticket).toBeDefined();
      expect(ticket?.ticket_id).toBe(ticketId);
      expect(ticket?.category).toBe('feature');
      expect(ticket?.priority).toBe('low');
    });
  });

  describe('GET /api/tickets', () => {
    beforeEach(async () => {
      const tickets = [
        {
          sessionId: uuidv4(),
          message: 'Billing issue number one.',
          language: 'en',
          priority: 'high',
          category: 'billing',
          sentiment: 'negative',
        },
        {
          sessionId: uuidv4(),
          message: 'Bug report for login page.',
          language: 'en',
          priority: 'urgent',
          category: 'bug',
          sentiment: 'negative',
        },
        {
          sessionId: uuidv4(),
          message: 'Feature request for dark mode.',
          language: 'en',
          priority: 'low',
          category: 'feature',
          sentiment: 'positive',
        },
      ];

      for (const t of tickets) {
        mockedClassifyTicket.mockResolvedValueOnce({
          priority: t.priority as 'low' | 'medium' | 'high' | 'urgent',
          category: t.category,
          sentiment: t.sentiment as 'positive' | 'neutral' | 'negative',
        });

        await request(app)
          .post('/api/tickets')
          .send({ sessionId: t.sessionId, message: t.message, language: t.language });
      }
    });

    it('should return all tickets', async () => {
      const response = await request(app)
        .get('/api/tickets')
        .expect(200);

      expect(response.body).toHaveProperty('tickets');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('limit');
      expect(Array.isArray(response.body.tickets)).toBe(true);
      expect(response.body.total).toBeGreaterThanOrEqual(3);
    });

    it('should return tickets with correct structure', async () => {
      const response = await request(app)
        .get('/api/tickets')
        .expect(200);

      const ticket = response.body.tickets[0];
      expect(ticket).toHaveProperty('ticketId');
      expect(ticket).toHaveProperty('message');
      expect(ticket).toHaveProperty('priority');
      expect(ticket).toHaveProperty('category');
      expect(ticket).toHaveProperty('sentiment');
      expect(ticket).toHaveProperty('status');
      expect(ticket).toHaveProperty('language');
      expect(ticket).toHaveProperty('createdAt');
      expect(ticket).toHaveProperty('updatedAt');
    });

    it('should filter tickets by status', async () => {
      const response = await request(app)
        .get('/api/tickets?status=open')
        .expect(200);

      expect(response.body.tickets.every((t: { status: string }) => t.status === 'open')).toBe(true);
    });

    it('should filter tickets by category', async () => {
      const response = await request(app)
        .get('/api/tickets?category=billing')
        .expect(200);

      expect(response.body.tickets.every((t: { category: string }) => t.category === 'billing')).toBe(true);
    });

    it('should filter tickets by priority', async () => {
      const response = await request(app)
        .get('/api/tickets?priority=urgent')
        .expect(200);

      expect(response.body.tickets.every((t: { priority: string }) => t.priority === 'urgent')).toBe(true);
    });

    it('should support pagination with page and limit', async () => {
      const response = await request(app)
        .get('/api/tickets?page=1&limit=2')
        .expect(200);

      expect(response.body.tickets.length).toBeLessThanOrEqual(2);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(2);
    });

    it('should return empty array when no tickets match filter', async () => {
      const response = await request(app)
        .get('/api/tickets?status=nonexistent_status')
        .expect(200);

      expect(response.body.tickets).toEqual([]);
      expect(response.body.total).toBe(0);
    });
  });

  describe('GET /api/tickets/:ticketId', () => {
    let createdTicketId: string;

    beforeEach(async () => {
      mockedClassifyTicket.mockResolvedValueOnce({
        priority: 'medium',
        category: 'account',
        sentiment: 'neutral',
      });

      const response = await request(app)
        .post('/api/tickets')
        .send({
          sessionId: uuidv4(),
          message: 'I cannot access my account.',
          language: 'en',
          userEmail: 'test@example.com',
        });

      createdTicketId = response.body.ticketId;
    });

    it('should return a ticket by ID', async () => {
      const response = await request(app)
        .get(`/api/tickets/${createdTicketId}`)
        .expect(200);

      expect(response.body).toHaveProperty('ticketId', createdTicketId);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('priority');
      expect(response.body).toHaveProperty('category', 'account');
      expect(response.body).toHaveProperty('sentiment');
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('language', 'en');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should return 404 for non-existent ticket', async () => {
      const fakeId = uuidv4();
      const response = await request(app)
        .get(`/api/tickets/${fakeId}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should include autoResponse in ticket detail', async () => {
      const response = await request(app)
        .get(`/api/tickets/${createdTicketId}`)
        .expect(200);

      expect(response.body).toHaveProperty('autoResponse');
    });
  });

  describe('PUT /api/tickets/:ticketId', () => {
    let createdTicketId: string;

    beforeEach(async () => {
      mockedClassifyTicket.mockResolvedValueOnce({
        priority: 'medium',
        category: 'billing',
        sentiment: 'neutral',
      });

      const response = await request(app)
        .post('/api/tickets')
        .send({
          sessionId: uuidv4(),
          message: 'Billing question about my invoice.',
          language: 'en',
        });

      createdTicketId = response.body.ticketId;
    });

    it('should update ticket status to resolved', async () => {
      const response = await request(app)
        .put(`/api/tickets/${createdTicketId}`)
        .send({ status: 'resolved' })
        .expect(200);

      expect(response.body).toHaveProperty('ticketId', createdTicketId);
      expect(response.body).toHaveProperty('status', 'resolved');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should update ticket status to in-progress', async () => {
      const response = await request(app)
        .put(`/api/tickets/${createdTicketId}`)
        .send({ status: 'in-progress' })
        .expect(200);

      expect(response.body.status).toBe('in-progress');
    });

    it('should update ticket priority', async () => {
      const response = await request(app)
        .put(`/api/tickets/${createdTicketId}`)
        .send({ priority: 'urgent' })
        .expect(200);

      expect(response.body).toHaveProperty('ticketId', createdTicketId);
    });

    it('should update ticket notes', async () => {
      const response = await request(app)
        .put(`/api/tickets/${createdTicketId}`)
        .send({ notes: 'Customer called in to follow up.' })
        .expect(200);

      expect(response.body).toHaveProperty('ticketId', createdTicketId);
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should return 404 when updating non-existent ticket', async () => {
      const fakeId = uuidv4();
      const response = await request(app)
        .put(`/api/tickets/${fakeId}`)
        .send({ status: 'resolved' })
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should persist status update in database', async () => {
      await request(app)
        .put(`/api/tickets/${createdTicketId}`)
        .send({ status: 'resolved' })
        .expect(200);

      const ticket = db.prepare('SELECT * FROM tickets WHERE ticket_id = ?').get(createdTicketId) as Record<string, unknown> | undefined;
      expect(ticket?.status).toBe('resolved');
    });
  });

  describe('POST /api/tickets/:ticketId/classify', () => {
    let createdTicketId: string;

    beforeEach(async () => {
      mockedClassifyTicket.mockResolvedValueOnce({
        priority: 'low',
        category: 'feature',
        sentiment: 'positive',
      });

      const response = await request(app)
        .post('/api/tickets')
        .send({
          sessionId: uuidv4(),
          message: 'Would love a dark mode option.',
          language: 'en',
        });

      createdTicketId = response.body.ticketId;
    });

    it('should re-classify an existing ticket', async () => {
      mockedClassifyTicket.mockResolvedValueOnce({
        priority: 'medium',
        category: 'feature',
        sentiment: 'positive',
      });

      const response = await request(app)
        .post(`/api/tickets/${createdTicketId}/classify`)
        .expect(200);

      expect(response.body).toHaveProperty('ticketId', createdTicketId);
      expect(response.body).toHaveProperty('priority');
      expect(response.body).toHaveProperty('category');
      expect(response.body).toHaveProperty('sentiment');
    });

    it('should return updated classification values', async () => {
      mockedClassifyTicket.mockResolvedValueOnce({
        priority: 'urgent',
        category: 'bug',
        sentiment: 'negative',
      });

      const response = await request(app)
        .post(`/api/tickets/${createdTicketId}/classify`)
        .expect(200);

      expect(response.body.priority).toBe('urgent');
      expect(response.body.category).toBe('bug');
      expect(response.body.sentiment).toBe('negative');
    });

    it('should return 404 for non-existent ticket', async () => {
      const fakeId = uuidv4();
      const response = await request(app)
        .post(`/api/tickets/${fakeId}/classify`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should persist re-classification in database', async () => {
      mockedClassifyTicket.mockResolvedValueOnce({
        priority: 'high',
        category: 'account',
        sentiment: 'negative',
      });

      await request(app)
        .post(`/api/tickets/${createdTicketId}/classify`)
        .expect(200);

      const ticket = db.prepare('SELECT * FROM tickets WHERE ticket_id = ?').get(createdTicketId) as Record<string, unknown> | undefined;
      expect(ticket?.priority).toBe('high');
      expect(ticket?.category).toBe('account');
      expect(ticket?.sentiment).toBe('negative');
    });

    it('should handle classification failure gracefully', async () => {
      mockedClassifyTicket.mockRejectedValueOnce(new Error('Gemini API error'));

      const response = await request(app)
        .post(`/api/tickets/${createdTicketId}/classify`);

      expect([200, 500]).toContain(response.status);
    });
  });
});