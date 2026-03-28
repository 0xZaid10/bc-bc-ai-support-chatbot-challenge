import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TicketStatusBadge from '../components/tickets/TicketStatusBadge';

describe('TicketStatusBadge', () => {
  it('renders open status correctly', () => {
    render(<TicketStatusBadge status="open" />);
    const badge = screen.getByText(/open/i);
    expect(badge).toBeDefined();
  });

  it('renders resolved status correctly', () => {
    render(<TicketStatusBadge status="resolved" />);
    const badge = screen.getByText(/resolved/i);
    expect(badge).toBeDefined();
  });

  it('renders in-progress status correctly', () => {
    render(<TicketStatusBadge status="in-progress" />);
    const badge = screen.getByText(/in-progress/i);
    expect(badge).toBeDefined();
  });

  it('renders closed status correctly', () => {
    render(<TicketStatusBadge status="closed" />);
    const badge = screen.getByText(/closed/i);
    expect(badge).toBeDefined();
  });

  it('applies correct class for open status', () => {
    const { container } = render(<TicketStatusBadge status="open" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('open');
  });

  it('applies correct class for resolved status', () => {
    const { container } = render(<TicketStatusBadge status="resolved" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('resolved');
  });

  it('applies correct class for in-progress status', () => {
    const { container } = render(<TicketStatusBadge status="in-progress" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('progress');
  });

  it('renders as a span element', () => {
    const { container } = render(<TicketStatusBadge status="open" />);
    expect(container.firstChild?.nodeName).toBe('SPAN');
  });

  it('renders with unknown status gracefully', () => {
    render(<TicketStatusBadge status="unknown" />);
    const badge = screen.getByText(/unknown/i);
    expect(badge).toBeDefined();
  });

  it('has accessible text content matching status', () => {
    render(<TicketStatusBadge status="resolved" />);
    const badge = screen.getByText('resolved');
    expect(badge.textContent).toBe('resolved');
  });
});