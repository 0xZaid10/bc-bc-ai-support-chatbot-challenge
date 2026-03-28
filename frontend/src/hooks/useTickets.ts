import { useState, useEffect, useCallback } from 'react';
import { ticketsApi } from '../services/ticketsApi';
import type {
  Ticket,
  TicketDetail,
  TicketFilters,
  TicketUpdatePayload,
  TicketsResponse,
} from '../types/index';

interface UseTicketsState {
  tickets: Ticket[];
  total: number;
  page: number;
  limit: number;
  loading: boolean;
  error: string | null;
}

interface UseTicketsReturn extends UseTicketsState {
  filters: TicketFilters;
  setFilters: (filters: TicketFilters) => void;
  setPage: (page: number) => void;
  refetch: () => void;
}

interface UseTicketDetailReturn {
  ticket: TicketDetail | null;
  loading: boolean;
  error: string | null;
  updating: boolean;
  updateError: string | null;
  classifying: boolean;
  classifyError: string | null;
  updateTicket: (payload: TicketUpdatePayload) => Promise<void>;
  classifyTicket: () => Promise<void>;
  refetch: () => void;
}

export function useTickets(initialFilters: TicketFilters = {}): UseTicketsReturn {
  const [state, setState] = useState<UseTicketsState>({
    tickets: [],
    total: 0,
    page: 1,
    limit: 20,
    loading: false,
    error: null,
  });

  const [filters, setFiltersState] = useState<TicketFilters>(initialFilters);
  const [page, setPageState] = useState<number>(1);

  const fetchTickets = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response: TicketsResponse = await ticketsApi.getTickets({
        ...filters,
        page,
        limit: state.limit,
      });
      setState((prev) => ({
        ...prev,
        tickets: response.tickets,
        total: response.total,
        page: response.page,
        limit: response.limit,
        loading: false,
        error: null,
      }));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch tickets';
      setState((prev) => ({
        ...prev,
        loading: false,
        error: message,
      }));
    }
  }, [filters, page, state.limit]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const setFilters = useCallback((newFilters: TicketFilters) => {
    setFiltersState(newFilters);
    setPageState(1);
  }, []);

  const setPage = useCallback((newPage: number) => {
    setPageState(newPage);
  }, []);

  return {
    ...state,
    filters,
    setFilters,
    setPage,
    refetch: fetchTickets,
  };
}

export function useTicketDetail(ticketId: string | undefined): UseTicketDetailReturn {
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [updating, setUpdating] = useState<boolean>(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const [classifying, setClassifying] = useState<boolean>(false);
  const [classifyError, setClassifyError] = useState<string | null>(null);

  const fetchTicket = useCallback(async () => {
    if (!ticketId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await ticketsApi.getTicketById(ticketId);
      setTicket(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch ticket';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  const updateTicket = useCallback(
    async (payload: TicketUpdatePayload) => {
      if (!ticketId) return;
      setUpdating(true);
      setUpdateError(null);
      try {
        const updated = await ticketsApi.updateTicket(ticketId, payload);
        setTicket((prev) =>
          prev
            ? {
                ...prev,
                status: updated.status,
                updatedAt: updated.updatedAt,
              }
            : prev
        );
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to update ticket';
        setUpdateError(message);
        throw err;
      } finally {
        setUpdating(false);
      }
    },
    [ticketId]
  );

  const classifyTicket = useCallback(async () => {
    if (!ticketId) return;
    setClassifying(true);
    setClassifyError(null);
    try {
      const classification = await ticketsApi.classifyTicket(ticketId);
      setTicket((prev) =>
        prev
          ? {
              ...prev,
              priority: classification.priority,
              category: classification.category,
              sentiment: classification.sentiment,
            }
          : prev
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to classify ticket';
      setClassifyError(message);
      throw err;
    } finally {
      setClassifying(false);
    }
  }, [ticketId]);

  return {
    ticket,
    loading,
    error,
    updating,
    updateError,
    classifying,
    classifyError,
    updateTicket,
    classifyTicket,
    refetch: fetchTicket,
  };
}