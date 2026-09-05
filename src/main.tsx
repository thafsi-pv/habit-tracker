import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import App from './App';
import { AuthProvider } from './hooks/use-auth';
import { PWAInstallPrompt } from '@/components/pwa-install-prompt';
import { usePWA } from '@/hooks/use-pwa';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

function PWAUpdates() {
  const { isUpdateAvailable, applyUpdate } = usePWA();

  React.useEffect(() => {
    if (isUpdateAvailable) {
      toast.info('App update available', {
        action: { label: 'Refresh', onClick: applyUpdate },
        duration: Infinity,
      });
    }
  }, [isUpdateAvailable, applyUpdate]);

  return null;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <App />
          <PWAUpdates />
          <PWAInstallPrompt />
          <Toaster position="top-center" richColors closeButton />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
