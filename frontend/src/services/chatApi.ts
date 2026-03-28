import apiClient from './apiClient';
import { ChatMessageRequest, ChatMessageResponse, CreateTicketRequest, CreateTicketResponse } from '../types';

export const chatApi = {
  sendMessage: async (request: ChatMessageRequest): Promise<ChatMessageResponse> => {
    const response = await apiClient.post<ChatMessageResponse>('/api/chat/message', request);
    return response.data;
  },

  createTicket: async (request: CreateTicketRequest): Promise<CreateTicketResponse> => {
    const response = await apiClient.post<CreateTicketResponse>('/api/tickets', request);
    return response.data;
  },
};

export default chatApi;