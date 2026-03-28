import apiClient from './apiClient';
import type {
  Ticket,
  TicketDetail,
  CreateTicketRequest,
  CreateTicketResponse,
  UpdateTicketRequest,
  UpdateTicketResponse,
  ClassifyTicketResponse,
  TicketsListResponse,
  TicketFilters,
} from '../types/index';

export const ticketsApi = {
  async getTickets(filters?: TicketFilters): Promise<TicketsListResponse> {
    const params: Record<string, string | number> = {};

    if (filters?.status) params.status = filters.status;
    if (filters?.priority) params.priority = filters.priority;
    if (filters?.category) params.category = filters.category;
    if (filters?.page !== undefined) params.page = filters.page;
    if (filters?.limit !== undefined) params.limit = filters.limit;

    const response = await apiClient.get<TicketsListResponse>('/api/tickets', { params });
    return response.data;
  },

  async getTicketById(ticketId: string): Promise<TicketDetail> {
    const response = await apiClient.get<TicketDetail>(`/api/tickets/${ticketId}`);
    return response.data;
  },

  async createTicket(data: CreateTicketRequest): Promise<CreateTicketResponse> {
    const response = await apiClient.post<CreateTicketResponse>('/api/tickets', data);
    return response.data;
  },

  async updateTicket(ticketId: string, data: UpdateTicketRequest): Promise<UpdateTicketResponse> {
    const response = await apiClient.put<UpdateTicketResponse>(`/api/tickets/${ticketId}`, data);
    return response.data;
  },

  async classifyTicket(ticketId: string): Promise<ClassifyTicketResponse> {
    const response = await apiClient.post<ClassifyTicketResponse>(
      `/api/tickets/${ticketId}/classify`
    );
    return response.data;
  },
};

export default ticketsApi;