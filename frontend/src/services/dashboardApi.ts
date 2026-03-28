import apiClient from './apiClient';
import { DashboardStats } from '../types';

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<DashboardStats>('/api/dashboard/stats');
    return response.data;
  },

  syncHelpdesk: async (): Promise<{ synced: number; failed: number; lastSyncAt: string }> => {
    const response = await apiClient.get<{ synced: number; failed: number; lastSyncAt: string }>(
      '/api/helpdesk/sync'
    );
    return response.data;
  },

  getHealth: async (): Promise<{ status: string; timestamp: string; geminiConnected: boolean }> => {
    const response = await apiClient.get<{
      status: string;
      timestamp: string;
      geminiConnected: boolean;
    }>('/api/health');
    return response.data;
  },
};

export default dashboardApi;