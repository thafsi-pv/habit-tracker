import axios from 'axios';

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (import.meta.env.PROD) return '/api';
  return 'http://localhost:3000';
};

export const api = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
});

let isRefreshing = false;
let pendingQueue: { resolve: () => void; reject: (err: unknown) => void }[] = [];

function flushQueue(error: unknown) {
  pendingQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve()));
  pendingQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const isAuthRoute = ['/auth/login', '/auth/signup', '/auth/refresh'].some((p) =>
      original?.url?.includes(p),
    );

    if (error.response?.status === 401 && !original._retry && !isAuthRoute) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve: () => resolve(api(original)), reject });
        });
      }

      isRefreshing = true;
      try {
        await api.post('/auth/refresh');
        flushQueue(null);
        return api(original);
      } catch (refreshError) {
        flushQueue(refreshError);
        if (!['/login', '/signup'].includes(window.location.pathname)) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
