import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      const message =
        data?.message ?? data?.error ?? `Request failed with status ${status}`;
      const enhancedError = new Error(message);
      (enhancedError as Error & { status: number; data: unknown }).status = status;
      (enhancedError as Error & { status: number; data: unknown }).data = data;
      return Promise.reject(enhancedError);
    }

    if (error.request) {
      const networkError = new Error(
        'Network error: Unable to reach the server. Please check your connection.'
      );
      return Promise.reject(networkError);
    }

    return Promise.reject(error);
  }
);

export default apiClient;