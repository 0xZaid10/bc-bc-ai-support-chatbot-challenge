import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DashboardStatsCard from '../components/dashboard/DashboardStatsCard';
import type { DashboardStats } from '../types/index';

const mockStats: DashboardStats = {
  totalTickets: 120,
  openTickets: 45,
  resolvedTickets: 75,
  avgResponseTimeMs: 3200,
  ticketsByPriority: {
    low: 30,
    medium: 50,
    high: 25,
    urgent: 15,
  },
  ticketsByCategory: {
    billing: 40,
    technical: 50,
    general: 30,
  },
  ticketsBySentiment: {
    positive: 60,
    neutral: 35,
    negative: 25,
  },
  ticketsByLanguage: {
    en: 80,
    es: 40,
  },
};

vi.mock('../hooks/useDashboard', () => ({
  useDashboard: vi.fn(),
}));

import { useDashboard } from '../hooks/useDashboard';

describe('DashboardStatsCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state when loading is true', () => {
    (useDashboard as ReturnType<typeof vi.fn>).mockReturnValue({
      stats: null,
      loading: true,
      error: null,
      refetch: vi.fn(),
    });

    render(<DashboardStatsCard />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders error state when error is present', () => {
    (useDashboard as ReturnType<typeof vi.fn>).mockReturnValue({
      stats: null,
      loading: false,
      error: 'Failed to load dashboard stats',
      refetch: vi.fn(),
    });

    render(<DashboardStatsCard />);

    expect(screen.getByText(/failed to load dashboard stats/i)).toBeInTheDocument();
  });

  it('renders total tickets count', () => {
    (useDashboard as ReturnType<typeof vi.fn>).mockReturnValue({
      stats: mockStats,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<DashboardStatsCard />);

    expect(screen.getByText('120')).toBeInTheDocument();
  });

  it('renders open tickets count', () => {
    (useDashboard as ReturnType<typeof vi.fn>).mockReturnValue({
      stats: mockStats,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<DashboardStatsCard />);

    expect(screen.getByText('45')).toBeInTheDocument();
  });

  it('renders resolved tickets count', () => {
    (useDashboard as ReturnType<typeof vi.fn>).mockReturnValue({
      stats: mockStats,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<DashboardStatsCard />);

    expect(screen.getByText('75')).toBeInTheDocument();
  });

  it('renders average response time', () => {
    (useDashboard as ReturnType<typeof vi.fn>).mockReturnValue({
      stats: mockStats,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<DashboardStatsCard />);

    expect(screen.getByText(/3\.2s|3200ms|3,200/i)).toBeInTheDocument();
  });

  it('renders stat labels', () => {
    (useDashboard as ReturnType<typeof vi.fn>).mockReturnValue({
      stats: mockStats,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<DashboardStatsCard />);

    expect(screen.getByText(/total tickets/i)).toBeInTheDocument();
    expect(screen.getByText(/open tickets/i)).toBeInTheDocument();
    expect(screen.getByText(/resolved/i)).toBeInTheDocument();
  });

  it('renders nothing critical when stats is null and not loading', () => {
    (useDashboard as ReturnType<typeof vi.fn>).mockReturnValue({
      stats: null,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    const { container } = render(<DashboardStatsCard />);

    expect(container).toBeInTheDocument();
  });

  it('displays correct total tickets value from stats', () => {
    const customStats: DashboardStats = {
      ...mockStats,
      totalTickets: 999,
      openTickets: 100,
      resolvedTickets: 899,
    };

    (useDashboard as ReturnType<typeof vi.fn>).mockReturnValue({
      stats: customStats,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<DashboardStatsCard />);

    expect(screen.getByText('999')).toBeInTheDocument();
  });

  it('displays zero values correctly', () => {
    const zeroStats: DashboardStats = {
      ...mockStats,
      totalTickets: 0,
      openTickets: 0,
      resolvedTickets: 0,
      avgResponseTimeMs: 0,
    };

    (useDashboard as ReturnType<typeof vi.fn>).mockReturnValue({
      stats: zeroStats,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<DashboardStatsCard />);

    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBeGreaterThan(0);
  });
});