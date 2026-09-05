import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
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
      toast(
        (t) => (
          <span className="flex items-center gap-2">
            App update available
            <button 
              onClick={() => { applyUpdate(); toast.dismiss(t.id); }}
              className="px-2 py-1 bg-primary text-primary-foreground rounded text-sm"
            >
              Refresh
            </button>
          </span>
        ),
        { duration: Infinity, icon: 'ℹ️' }
      );
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
          <Toaster position="bottom-center" />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
