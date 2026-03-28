import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useChat } from '../../hooks/useChat';
import ChatMessageBubble from './ChatMessageBubble';
import ChatInputBar from './ChatInputBar';
import LanguageSwitcher from './LanguageSwitcher';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';
import { useTranslation } from 'react-i18next';

interface ChatWindowProps {
  className?: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ className = '' }) => {
  const { t } = useTranslation();
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    messages,
    isLoading,
    error,
    sessionId,
    sendMessage,
    createTicket,
    clearError,
    isCreatingTicket,
    lastTicketId,
  } = useChat();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      await sendMessage(text, language);
    },
    [sendMessage, language]
  );

  const handleCreateTicket = useCallback(
    async (message: string) => {
      if (!message.trim()) return;
      await createTicket(message, language);
    },
    [createTicket, language]
  );

  const handleLanguageChange = useCallback((lang: 'en' | 'es') => {
    setLanguage(lang);
  }, []);

  return (
    <div
      className={`flex flex-col h-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </div>
          <div>
            <h2 className="font-semibold text-lg leading-tight">
              {t('chat.title', 'AI Support Assistant')}
            </h2>
            <p className="text-xs text-white/70">
              {t('chat.subtitle', 'Powered by Gemini AI')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {sessionId && (
            <span className="text-xs text-white/60 hidden sm:block">
              {t('chat.session', 'Session')}: {sessionId.slice(0, 8)}...
            </span>
          )}
          <LanguageSwitcher
            currentLanguage={language}
            onLanguageChange={handleLanguageChange}
          />
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 bg-gray-50 min-h-0">
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-indigo-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3 className="text-gray-700 font-medium text-lg mb-2">
              {t('chat.emptyTitle', 'How can I help you today?')}
            </h3>
            <p className="text-gray-400 text-sm max-w-xs">
              {t(
                'chat.emptySubtitle',
                'Ask me anything about your support needs. I can respond in English or Spanish.'
              )}
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessageBubble
            key={msg.id}
            message={msg}
            onCreateTicket={
              msg.role === 'user'
                ? () => handleCreateTicket(msg.content)
                : undefined
            }
          />
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-4 h-4 text-indigo-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2h-2"
                />
              </svg>
            </div>
            <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
              </div>
            </div>
          </div>
        )}

        {isCreatingTicket && (
          <div className="flex items-center justify-center py-2">
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-sm text-amber-700">
              <LoadingSpinner size="sm" />
              <span>{t('chat.creatingTicket', 'Creating support ticket...')}</span>
            </div>
          </div>
        )}

        {lastTicketId && (
          <div className="flex items-center justify-center py-2">
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-sm text-green-700">
              <svg
                className="w-4 h-4 text-green-500 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>
                {t('chat.ticketCreated', 'Ticket created')}: #{lastTicketId.slice(0, 8)}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-2">
          <ErrorAlert message={error} onDismiss={clearError} />
        </div>
      )}

      {/* Input Bar */}
      <div className="border-t border-gray-200 bg-white px-4 py-3">
        <ChatInputBar
          onSend={handleSendMessage}
          isLoading={isLoading}
          language={language}
          onCreateTicket={
            messages.length > 0
              ? () => {
                  const lastUserMsg = [...messages]
                    .reverse()
                    .find((m) => m.role === 'user');
                  if (lastUserMsg) {
                    handleCreateTicket(lastUserMsg.content);
                  }
                }
              : undefined
          }
        />
      </div>
    </div>
  );
};

export default ChatWindow;