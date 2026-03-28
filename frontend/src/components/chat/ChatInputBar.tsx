import React, { useState, useRef, KeyboardEvent } from 'react';

interface ChatInputBarProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

const ChatInputBar: React.FC<ChatInputBarProps> = ({
  onSendMessage,
  isLoading = false,
  disabled = false,
  placeholder = 'Type your message...',
}) => {
  const [inputValue, setInputValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading || disabled) return;
    onSendMessage(trimmed);
    setInputValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
    }
  };

  const isDisabled = disabled || isLoading;
  const canSend = inputValue.trim().length > 0 && !isDisabled;

  return (
    <div className="chat-input-bar">
      <div className="chat-input-container">
        <textarea
          ref={textareaRef}
          className="chat-textarea"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isDisabled}
          rows={1}
          aria-label="Chat message input"
        />
        <button
          className={`chat-send-button ${canSend ? 'chat-send-button--active' : 'chat-send-button--inactive'}`}
          onClick={handleSend}
          disabled={!canSend}
          aria-label="Send message"
          type="button"
        >
          {isLoading ? (
            <span className="chat-send-spinner" aria-hidden="true">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="spin"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="31.4 31.4"
                />
              </svg>
            </span>
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M22 2L11 13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M22 2L15 22L11 13L2 9L22 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>
      <p className="chat-input-hint">
        Press <kbd>Enter</kbd> to send, <kbd>Shift+Enter</kbd> for new line
      </p>

      <style>{`
        .chat-input-bar {
          padding: 12px 16px 8px;
          background: #ffffff;
          border-top: 1px solid #e5e7eb;
        }

        .chat-input-container {
          display: flex;
          align-items: flex-end;
          gap: 10px;
          background: #f9fafb;
          border: 1.5px solid #d1d5db;
          border-radius: 12px;
          padding: 8px 8px 8px 14px;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .chat-input-container:focus-within {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
          background: #ffffff;
        }

        .chat-textarea {
          flex: 1;
          resize: none;
          border: none;
          outline: none;
          background: transparent;
          font-size: 0.9375rem;
          line-height: 1.5;
          color: #111827;
          font-family: inherit;
          max-height: 160px;
          overflow-y: auto;
          padding: 2px 0;
        }

        .chat-textarea::placeholder {
          color: #9ca3af;
        }

        .chat-textarea:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .chat-send-button {
          flex-shrink: 0;
          width: 38px;
          height: 38px;
          border-radius: 9px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s ease, transform 0.1s ease, opacity 0.2s ease;
        }

        .chat-send-button--active {
          background: #6366f1;
          color: #ffffff;
        }

        .chat-send-button--active:hover {
          background: #4f46e5;
          transform: scale(1.05);
        }

        .chat-send-button--active:active {
          transform: scale(0.97);
        }

        .chat-send-button--inactive {
          background: #e5e7eb;
          color: #9ca3af;
          cursor: not-allowed;
        }

        .chat-send-spinner {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .spin {
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .chat-input-hint {
          margin: 5px 2px 0;
          font-size: 0.72rem;
          color: #9ca3af;
        }

        .chat-input-hint kbd {
          display: inline-block;
          padding: 1px 5px;
          font-size: 0.68rem;
          font-family: monospace;
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          color: #6b7280;
        }
      `}</style>
    </div>
  );
};

export default ChatInputBar;