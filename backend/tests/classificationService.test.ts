import { classifyTicket } from '../src/services/classificationService';
import { geminiService } from '../src/services/geminiService';

jest.mock('../src/services/geminiService', () => ({
  geminiService: {
    classifyTicket: jest.fn(),
  },
}));

const mockGeminiService = geminiService as jest.Mocked<typeof geminiService>;

describe('classificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('classifyTicket', () => {
    it('should return classification result from geminiService', async () => {
      const mockClassification = {
        priority: 'high' as const,
        category: 'billing',
        sentiment: 'negative' as const,
      };

      mockGeminiService.classifyTicket.mockResolvedValueOnce(mockClassification);

      const result = await classifyTicket('My invoice is wrong and I was charged twice!', 'en');

      expect(mockGeminiService.classifyTicket).toHaveBeenCalledWith(
        'My invoice is wrong and I was charged twice!',
        'en'
      );
      expect(result).toEqual(mockClassification);
    });

    it('should classify billing issues correctly', async () => {
      const mockClassification = {
        priority: 'high' as const,
        category: 'billing',
        sentiment: 'negative' as const,
      };

      mockGeminiService.classifyTicket.mockResolvedValueOnce(mockClassification);

      const result = await classifyTicket('I was charged twice for my subscription', 'en');

      expect(result.category).toBe('billing');
      expect(result.priority).toBe('high');
      expect(result.sentiment).toBe('negative');
    });

    it('should classify bug reports correctly', async () => {
      const mockClassification = {
        priority: 'urgent' as const,
        category: 'bug',
        sentiment: 'negative' as const,
      };

      mockGeminiService.classifyTicket.mockResolvedValueOnce(mockClassification);

      const result = await classifyTicket('The application crashes every time I try to login', 'en');

      expect(result.category).toBe('bug');
      expect(result.priority).toBe('urgent');
      expect(result.sentiment).toBe('negative');
    });

    it('should classify feature requests correctly', async () => {
      const mockClassification = {
        priority: 'low' as const,
        category: 'feature',
        sentiment: 'positive' as const,
      };

      mockGeminiService.classifyTicket.mockResolvedValueOnce(mockClassification);

      const result = await classifyTicket('It would be great to have dark mode support', 'en');

      expect(result.category).toBe('feature');
      expect(result.priority).toBe('low');
      expect(result.sentiment).toBe('positive');
    });

    it('should classify account issues correctly', async () => {
      const mockClassification = {
        priority: 'medium' as const,
        category: 'account',
        sentiment: 'neutral' as const,
      };

      mockGeminiService.classifyTicket.mockResolvedValueOnce(mockClassification);

      const result = await classifyTicket('I cannot reset my password', 'en');

      expect(result.category).toBe('account');
      expect(result.priority).toBe('medium');
    });

    it('should handle Spanish language messages', async () => {
      const mockClassification = {
        priority: 'high' as const,
        category: 'billing',
        sentiment: 'negative' as const,
      };

      mockGeminiService.classifyTicket.mockResolvedValueOnce(mockClassification);

      const result = await classifyTicket('Me cobraron dos veces en mi factura', 'es');

      expect(mockGeminiService.classifyTicket).toHaveBeenCalledWith(
        'Me cobraron dos veces en mi factura',
        'es'
      );
      expect(result).toEqual(mockClassification);
    });

    it('should handle neutral sentiment for general inquiries', async () => {
      const mockClassification = {
        priority: 'low' as const,
        category: 'account',
        sentiment: 'neutral' as const,
      };

      mockGeminiService.classifyTicket.mockResolvedValueOnce(mockClassification);

      const result = await classifyTicket('How do I update my profile information?', 'en');

      expect(result.sentiment).toBe('neutral');
      expect(result.priority).toBe('low');
    });

    it('should use fallback classification when geminiService throws an error', async () => {
      mockGeminiService.classifyTicket.mockRejectedValueOnce(new Error('Gemini API error'));

      const result = await classifyTicket('Some message that causes an error', 'en');

      expect(result).toHaveProperty('priority');
      expect(result).toHaveProperty('category');
      expect(result).toHaveProperty('sentiment');
      expect(['low', 'medium', 'high', 'urgent']).toContain(result.priority);
      expect(['billing', 'bug', 'feature', 'account', 'general']).toContain(result.category);
      expect(['positive', 'neutral', 'negative']).toContain(result.sentiment);
    });

    it('should return valid priority values', async () => {
      const validPriorities = ['low', 'medium', 'high', 'urgent'];

      mockGeminiService.classifyTicket.mockResolvedValueOnce({
        priority: 'medium' as const,
        category: 'general',
        sentiment: 'neutral' as const,
      });

      const result = await classifyTicket('General question about the service', 'en');

      expect(validPriorities).toContain(result.priority);
    });

    it('should return valid sentiment values', async () => {
      const validSentiments = ['positive', 'neutral', 'negative'];

      mockGeminiService.classifyTicket.mockResolvedValueOnce({
        priority: 'low' as const,
        category: 'feature',
        sentiment: 'positive' as const,
      });

      const result = await classifyTicket('I love this product, just a small suggestion', 'en');

      expect(validSentiments).toContain(result.sentiment);
    });

    it('should handle empty message gracefully', async () => {
      mockGeminiService.classifyTicket.mockResolvedValueOnce({
        priority: 'low' as const,
        category: 'general',
        sentiment: 'neutral' as const,
      });

      const result = await classifyTicket('', 'en');

      expect(result).toHaveProperty('priority');
      expect(result).toHaveProperty('category');
      expect(result).toHaveProperty('sentiment');
    });

    it('should call geminiService.classifyTicket exactly once per invocation', async () => {
      mockGeminiService.classifyTicket.mockResolvedValueOnce({
        priority: 'medium' as const,
        category: 'bug',
        sentiment: 'negative' as const,
      });

      await classifyTicket('The button does not work', 'en');

      expect(mockGeminiService.classifyTicket).toHaveBeenCalledTimes(1);
    });

    it('should handle urgent priority for critical issues', async () => {
      const mockClassification = {
        priority: 'urgent' as const,
        category: 'bug',
        sentiment: 'negative' as const,
      };

      mockGeminiService.classifyTicket.mockResolvedValueOnce(mockClassification);

      const result = await classifyTicket(
        'CRITICAL: Production system is completely down, all users affected!',
        'en'
      );

      expect(result.priority).toBe('urgent');
      expect(result.sentiment).toBe('negative');
    });

    it('should handle positive sentiment for compliments', async () => {
      const mockClassification = {
        priority: 'low' as const,
        category: 'general',
        sentiment: 'positive' as const,
      };

      mockGeminiService.classifyTicket.mockResolvedValueOnce(mockClassification);

      const result = await classifyTicket(
        'Your support team is amazing! Thank you so much for the quick help.',
        'en'
      );

      expect(result.sentiment).toBe('positive');
    });

    it('should pass language parameter correctly to geminiService', async () => {
      mockGeminiService.classifyTicket.mockResolvedValueOnce({
        priority: 'medium' as const,
        category: 'account',
        sentiment: 'neutral' as const,
      });

      await classifyTicket('No puedo acceder a mi cuenta', 'es');

      expect(mockGeminiService.classifyTicket).toHaveBeenCalledWith(
        'No puedo acceder a mi cuenta',
        'es'
      );
    });
  });
});