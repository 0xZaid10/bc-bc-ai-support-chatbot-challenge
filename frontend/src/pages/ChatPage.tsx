import React from 'react';
import { useTranslation } from 'react-i18next';
import ChatWindow from '../components/chat/ChatWindow';

const ChatPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('chat.title', 'AI Support Chat')}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t('chat.subtitle', 'Chat with our AI assistant in English or Spanish. We\'ll automatically detect your language.')}
        </p>
      </div>
      <div className="flex-1 min-h-0">
        <ChatWindow />
      </div>
    </div>
  );
};

export default ChatPage;