import { useState, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { sendMessage, createTicket } from '../services/chatApi';
import type { ChatMessage, ChatSession, CreateTicketResponse } from '../types';

interface UseChatReturn {
  messages: ChatMessage[];
  sessionId: string;
  isLoading: boolean;
  error: string | null;
  detectedLanguage: string;
  lastTicket: CreateTicketResponse | null;
  sendChatMessage: (message: string, language?: string) => Promise<void>;
  createSupportTicket: (userEmail?: string) => Promise<CreateTicketResponse | null>;
  clearMessages: () => void;
  clearError: () => void;
}

export function useChat(initialLanguage: string = 'en'): UseChatReturn {
  const sessionIdRef = useRef<string>(uuidv4());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectedLanguage, setDetectedLanguage] = useState<string>(initialLanguage);
  const [lastTicket, setLastTicket] = useState<CreateTicketResponse | null>(null);
  const lastUserMessageRef = useRef<string>('');

  const sendChatMessage = useCallback(async (message: string, language?: string) => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString(),
      language: language || detectedLanguage,
    };

    setMessages(prev => [...prev, userMessage]);
    lastUserMessageRef.current = message.trim();
    setIsLoading(true);
    setError(null);

    try {
      const response = await sendMessage({
        sessionId: sessionIdRef.current,
        message: message.trim(),
        language: language || detectedLanguage,
      });

      if (response.detectedLanguage) {
        setDetectedLanguage(response.detectedLanguage);
      }

      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: response.reply,
        timestamp: new Date().toISOString(),
        language: response.detectedLanguage || detectedLanguage,
        ticketId: response.ticketId,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);

      const errorReply: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content:
          detectedLanguage === 'es'
            ? 'Lo siento, ocurrió un error. Por favor, inténtalo de nuevo.'
            : 'Sorry, an error occurred. Please try again.',
        timestamp: new Date().toISOString(),
        language: detectedLanguage,
        isError: true,
      };

      setMessages(prev => [...prev, errorReply]);
    } finally {
      setIsLoading(false);
    }
  }, [detectedLanguage]);

  const createSupportTicket = useCallback(async (userEmail?: string): Promise<CreateTicketResponse | null> => {
    if (!lastUserMessageRef.current) {
      setError('No message to create a ticket from');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const ticket = await createTicket({
        sessionId: sessionIdRef.current,
        message: lastUserMessageRef.current,
        language: detectedLanguage,
        userEmail,
      });

      setLastTicket(ticket);
      return ticket;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create ticket';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [detectedLanguage]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    sessionIdRef.current = uuidv4();
    lastUserMessageRef.current = '';
    setLastTicket(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    messages,
    sessionId: sessionIdRef.current,
    isLoading,
    error,
    detectedLanguage,
    lastTicket,
    sendChatMessage,
    createSupportTicket,
    clearMessages,
    clearError,
  };
}

export default useChat;