import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ChatMessageBubble from '../components/chat/ChatMessageBubble';

describe('ChatMessageBubble', () => {
  it('renders user message correctly', () => {
    render(
      <ChatMessageBubble
        role="user"
        content="Hello, I need help!"
        timestamp={new Date('2024-01-01T10:00:00Z')}
      />
    );
    expect(screen.getByText('Hello, I need help!')).toBeInTheDocument();
  });

  it('renders assistant message correctly', () => {
    render(
      <ChatMessageBubble
        role="assistant"
        content="Sure, I can help you with that."
        timestamp={new Date('2024-01-01T10:01:00Z')}
      />
    );
    expect(screen.getByText('Sure, I can help you with that.')).toBeInTheDocument();
  });

  it('applies user bubble styling for user role', () => {
    const { container } = render(
      <ChatMessageBubble
        role="user"
        content="User message"
        timestamp={new Date()}
      />
    );
    const bubble = container.querySelector('.bg-blue-600, [class*="user"], [class*="justify-end"]');
    expect(container.firstChild).toBeTruthy();
  });

  it('applies assistant bubble styling for assistant role', () => {
    const { container } = render(
      <ChatMessageBubble
        role="assistant"
        content="Assistant message"
        timestamp={new Date()}
      />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('displays the message content as text', () => {
    const message = 'This is a test message for the chatbot.';
    render(
      <ChatMessageBubble
        role="user"
        content={message}
        timestamp={new Date()}
      />
    );
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it('displays the message content for assistant role', () => {
    const message = 'This is an automated response from the AI assistant.';
    render(
      <ChatMessageBubble
        role="assistant"
        content={message}
        timestamp={new Date()}
      />
    );
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it('renders timestamp when provided', () => {
    const timestamp = new Date('2024-06-15T14:30:00Z');
    render(
      <ChatMessageBubble
        role="user"
        content="Message with timestamp"
        timestamp={timestamp}
      />
    );
    expect(screen.getByText('Message with timestamp')).toBeInTheDocument();
  });

  it('renders without crashing when content is empty string', () => {
    const { container } = render(
      <ChatMessageBubble
        role="user"
        content=""
        timestamp={new Date()}
      />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders long message content correctly', () => {
    const longMessage = 'A'.repeat(500);
    render(
      <ChatMessageBubble
        role="assistant"
        content={longMessage}
        timestamp={new Date()}
      />
    );
    expect(screen.getByText(longMessage)).toBeInTheDocument();
  });

  it('renders special characters in message content', () => {
    const specialMessage = 'Hello! ¿Cómo puedo ayudarte? 😊 <test> & "quotes"';
    render(
      <ChatMessageBubble
        role="user"
        content={specialMessage}
        timestamp={new Date()}
      />
    );
    expect(screen.getByText(specialMessage)).toBeInTheDocument();
  });

  it('renders Spanish language message correctly', () => {
    const spanishMessage = 'Necesito ayuda con mi pedido, por favor.';
    render(
      <ChatMessageBubble
        role="user"
        content={spanishMessage}
        timestamp={new Date()}
      />
    );
    expect(screen.getByText(spanishMessage)).toBeInTheDocument();
  });

  it('renders assistant Spanish response correctly', () => {
    const spanishResponse = 'Claro, puedo ayudarte con eso. ¿Cuál es tu número de pedido?';
    render(
      <ChatMessageBubble
        role="assistant"
        content={spanishResponse}
        timestamp={new Date()}
      />
    );
    expect(screen.getByText(spanishResponse)).toBeInTheDocument();
  });
});