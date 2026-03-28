import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

jest.mock('../src/services/geminiService');
jest.mock('../src/db/database');

import { ChatService } from '../src/services/chatService';
import * as geminiService from '../src/services/geminiService';
import { getDatabase } from '../src/db/database';

const mockGeminiService = geminiService as jest.Mocked<typeof geminiService>;

const mockDb = {
  prepare: jest.fn(),
  exec: jest.fn(),
};

const mockStatement = {
  run: jest.fn(),
  get: jest.fn(),
  all: jest.fn(),
};

(getDatabase as jest.MockedFunction<typeof getDatabase>).mockReturnValue(mockDb as any);
mockDb.prepare.mockReturnValue(mockStatement as any);

describe('ChatService', () => {
  let chatService: ChatService;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDb.prepare.mockReturnValue(mockStatement as any);
    chatService = new ChatService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendMessage', () => {
    it('should return a reply with sessionId and detectedLanguage for English input', async () => {
      const mockReply = 'Hello! How can I help you today?';
      const mockDetectedLanguage = 'en';

      mockGeminiService.generateChatResponse.mockResolvedValue({
        reply: mockReply,
        detectedLanguage: mockDetectedLanguage,
      });

      mockStatement.all.mockReturnValue([]);
      mockStatement.run.mockReturnValue({ lastInsertRowid: 1 });

      const result = await chatService.sendMessage({
        sessionId: 'test-session-123',
        message: 'Hello, I need help with my account',
        language: 'en',
      });

      expect(result).toBeDefined();
      expect(result.sessionId).toBe('test-session-123');
      expect(result.reply).toBe(mockReply);
      expect(result.detectedLanguage).toBe(mockDetectedLanguage);
    });

    it('should return a reply in Spanish for Spanish input', async () => {
      const mockReply = '¡Hola! ¿Cómo puedo ayudarte hoy?';
      const mockDetectedLanguage = 'es';

      mockGeminiService.generateChatResponse.mockResolvedValue({
        reply: mockReply,
        detectedLanguage: mockDetectedLanguage,
      });

      mockStatement.all.mockReturnValue([]);
      mockStatement.run.mockReturnValue({ lastInsertRowid: 1 });

      const result = await chatService.sendMessage({
        sessionId: 'test-session-456',
        message: 'Hola, necesito ayuda con mi cuenta',
        language: 'es',
      });

      expect(result).toBeDefined();
      expect(result.sessionId).toBe('test-session-456');
      expect(result.reply).toBe(mockReply);
      expect(result.detectedLanguage).toBe('es');
    });

    it('should generate a new sessionId if not provided', async () => {
      const mockReply = 'Hello! How can I help you?';

      mockGeminiService.generateChatResponse.mockResolvedValue({
        reply: mockReply,
        detectedLanguage: 'en',
      });

      mockStatement.all.mockReturnValue([]);
      mockStatement.run.mockReturnValue({ lastInsertRowid: 1 });

      const result = await chatService.sendMessage({
        sessionId: '',
        message: 'I need support',
      });

      expect(result).toBeDefined();
      expect(result.sessionId).toBeTruthy();
      expect(typeof result.sessionId).toBe('string');
      expect(result.sessionId.length).toBeGreaterThan(0);
    });

    it('should include conversation history in subsequent messages', async () => {
      const existingHistory = [
        {
          id: 1,
          session_id: 'test-session-789',
          role: 'user',
          content: 'Hello',
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          session_id: 'test-session-789',
          role: 'assistant',
          content: 'Hi there! How can I help?',
          created_at: new Date().toISOString(),
        },
      ];

      mockStatement.all.mockReturnValue(existingHistory);
      mockStatement.run.mockReturnValue({ lastInsertRowid: 3 });

      mockGeminiService.generateChatResponse.mockResolvedValue({
        reply: 'Sure, I can help with billing issues.',
        detectedLanguage: 'en',
      });

      const result = await chatService.sendMessage({
        sessionId: 'test-session-789',
        message: 'I have a billing question',
      });

      expect(result).toBeDefined();
      expect(result.reply).toBe('Sure, I can help with billing issues.');
      expect(mockGeminiService.generateChatResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'I have a billing question',
          history: expect.arrayContaining([
            expect.objectContaining({ role: 'user', content: 'Hello' }),
            expect.objectContaining({ role: 'assistant', content: 'Hi there! How can I help?' }),
          ]),
        })
      );
    });

    it('should handle Gemini API errors gracefully with fallback response', async () => {
      mockGeminiService.generateChatResponse.mockRejectedValue(
        new Error('Gemini API unavailable')
      );

      mockStatement.all.mockReturnValue([]);
      mockStatement.run.mockReturnValue({ lastInsertRowid: 1 });

      const result = await chatService.sendMessage({
        sessionId: 'test-session-error',
        message: 'Help me please',
      });

      expect(result).toBeDefined();
      expect(result.sessionId).toBe('test-session-error');
      expect(result.reply).toBeTruthy();
      expect(typeof result.reply).toBe('string');
      expect(result.reply.length).toBeGreaterThan(0);
    });

    it('should save user message and assistant reply to database', async () => {
      const mockReply = 'I can help you with that!';

      mockGeminiService.generateChatResponse.mockResolvedValue({
        reply: mockReply,
        detectedLanguage: 'en',
      });

      mockStatement.all.mockReturnValue([]);
      mockStatement.run.mockReturnValue({ lastInsertRowid: 1 });

      await chatService.sendMessage({
        sessionId: 'test-session-save',
        message: 'Can you help me?',
      });

      expect(mockDb.prepare).toHaveBeenCalled();
      expect(mockStatement.run).toHaveBeenCalledTimes(2);
    });

    it('should return detectedLanguage from Gemini response', async () => {
      mockGeminiService.generateChatResponse.mockResolvedValue({
        reply: 'Entendido, te ayudaré con eso.',
        detectedLanguage: 'es',
      });

      mockStatement.all.mockReturnValue([]);
      mockStatement.run.mockReturnValue({ lastInsertRowid: 1 });

      const result = await chatService.sendMessage({
        sessionId: 'test-lang-detect',
        message: 'Necesito ayuda urgente',
      });

      expect(result.detectedLanguage).toBe('es');
    });
  });

  describe('getSessionHistory', () => {
    it('should return conversation history for a session', async () => {
      const mockHistory = [
        {
          id: 1,
          session_id: 'test-session-hist',
          role: 'user',
          content: 'Hello',
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          session_id: 'test-session-hist',
          role: 'assistant',
          content: 'Hi! How can I help?',
          created_at: new Date().toISOString(),
        },
      ];

      mockStatement.all.mockReturnValue(mockHistory);

      const history = await chatService.getSessionHistory('test-session-hist');

      expect(history).toBeDefined();
      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBe(2);
      expect(history[0].role).toBe('user');
      expect(history[1].role).toBe('assistant');
    });

    it('should return empty array for non-existent session', async () => {
      mockStatement.all.mockReturnValue([]);

      const history = await chatService.getSessionHistory('non-existent-session');

      expect(history).toBeDefined();
      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBe(0);
    });
  });
});