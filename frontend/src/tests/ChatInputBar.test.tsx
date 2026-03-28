import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ChatInputBar from '../components/chat/ChatInputBar';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'chat.inputPlaceholder': 'Type a message...',
        'chat.send': 'Send',
        'chat.sending': 'Sending...',
      };
      return translations[key] || key;
    },
    i18n: {
      changeLanguage: vi.fn(),
      language: 'en',
    },
  }),
}));

describe('ChatInputBar', () => {
  const mockOnSend = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the input field and send button', () => {
    render(<ChatInputBar onSend={mockOnSend} isLoading={false} />);

    expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('updates input value when user types', async () => {
    const user = userEvent.setup();
    render(<ChatInputBar onSend={mockOnSend} isLoading={false} />);

    const input = screen.getByPlaceholderText('Type a message...');
    await user.type(input, 'Hello world');

    expect(input).toHaveValue('Hello world');
  });

  it('calls onSend with the message when send button is clicked', async () => {
    const user = userEvent.setup();
    render(<ChatInputBar onSend={mockOnSend} isLoading={false} />);

    const input = screen.getByPlaceholderText('Type a message...');
    await user.type(input, 'Test message');

    const sendButton = screen.getByRole('button', { name: /send/i });
    await user.click(sendButton);

    expect(mockOnSend).toHaveBeenCalledWith('Test message');
  });

  it('clears the input after sending a message', async () => {
    const user = userEvent.setup();
    render(<ChatInputBar onSend={mockOnSend} isLoading={false} />);

    const input = screen.getByPlaceholderText('Type a message...');
    await user.type(input, 'Test message');
    await user.click(screen.getByRole('button', { name: /send/i }));

    expect(input).toHaveValue('');
  });

  it('calls onSend when Enter key is pressed', async () => {
    const user = userEvent.setup();
    render(<ChatInputBar onSend={mockOnSend} isLoading={false} />);

    const input = screen.getByPlaceholderText('Type a message...');
    await user.type(input, 'Hello{Enter}');

    expect(mockOnSend).toHaveBeenCalledWith('Hello');
  });

  it('does not call onSend when input is empty', async () => {
    const user = userEvent.setup();
    render(<ChatInputBar onSend={mockOnSend} isLoading={false} />);

    const sendButton = screen.getByRole('button', { name: /send/i });
    await user.click(sendButton);

    expect(mockOnSend).not.toHaveBeenCalled();
  });

  it('does not call onSend when input contains only whitespace', async () => {
    const user = userEvent.setup();
    render(<ChatInputBar onSend={mockOnSend} isLoading={false} />);

    const input = screen.getByPlaceholderText('Type a message...');
    await user.type(input, '   ');

    const sendButton = screen.getByRole('button', { name: /send/i });
    await user.click(sendButton);

    expect(mockOnSend).not.toHaveBeenCalled();
  });

  it('disables the send button when isLoading is true', () => {
    render(<ChatInputBar onSend={mockOnSend} isLoading={true} />);

    const sendButton = screen.getByRole('button');
    expect(sendButton).toBeDisabled();
  });

  it('disables the input when isLoading is true', () => {
    render(<ChatInputBar onSend={mockOnSend} isLoading={true} />);

    const input = screen.getByPlaceholderText('Type a message...');
    expect(input).toBeDisabled();
  });

  it('does not call onSend when loading and Enter is pressed', async () => {
    const user = userEvent.setup();
    render(<ChatInputBar onSend={mockOnSend} isLoading={true} />);

    const input = screen.getByPlaceholderText('Type a message...');

    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(mockOnSend).not.toHaveBeenCalled();
  });

  it('does not submit on Shift+Enter', async () => {
    const user = userEvent.setup();
    render(<ChatInputBar onSend={mockOnSend} isLoading={false} />);

    const input = screen.getByPlaceholderText('Type a message...');
    await user.type(input, 'Hello');
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });

    expect(mockOnSend).not.toHaveBeenCalled();
  });

  it('trims whitespace from message before sending', async () => {
    const user = userEvent.setup();
    render(<ChatInputBar onSend={mockOnSend} isLoading={false} />);

    const input = screen.getByPlaceholderText('Type a message...');
    await user.type(input, '  Hello world  ');
    await user.click(screen.getByRole('button', { name: /send/i }));

    expect(mockOnSend).toHaveBeenCalledWith('Hello world');
  });

  it('renders with correct initial state', () => {
    render(<ChatInputBar onSend={mockOnSend} isLoading={false} />);

    const input = screen.getByPlaceholderText('Type a message...');
    expect(input).toHaveValue('');

    const sendButton = screen.getByRole('button', { name: /send/i });
    expect(sendButton).toBeInTheDocument();
  });

  it('send button is enabled when there is text and not loading', async () => {
    const user = userEvent.setup();
    render(<ChatInputBar onSend={mockOnSend} isLoading={false} />);

    const input = screen.getByPlaceholderText('Type a message...');
    await user.type(input, 'Some text');

    const sendButton = screen.getByRole('button', { name: /send/i });
    expect(sendButton).not.toBeDisabled();
  });

  it('handles multiple messages sent sequentially', async () => {
    const user = userEvent.setup();
    render(<ChatInputBar onSend={mockOnSend} isLoading={false} />);

    const input = screen.getByPlaceholderText('Type a message...');

    await user.type(input, 'First message');
    await user.click(screen.getByRole('button', { name: /send/i }));

    await user.type(input, 'Second message');
    await user.click(screen.getByRole('button', { name: /send/i }));

    expect(mockOnSend).toHaveBeenCalledTimes(2);
    expect(mockOnSend).toHaveBeenNthCalledWith(1, 'First message');
    expect(mockOnSend).toHaveBeenNthCalledWith(2, 'Second message');
  });
});