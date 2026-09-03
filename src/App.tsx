import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/protected-route';
import { AppLayout } from '@/components/app-layout';
import { TrackerProvider } from '@/hooks/use-active-tracker';
import Login from '@/pages/login';
import Signup from '@/pages/signup';
import AuthCallback from '@/pages/auth-callback';
import CreateTracker from '@/pages/create-tracker';
import Home from '@/pages/home';
import ProgressPage from '@/pages/progress';
import History from '@/pages/history';
import Settings from '@/pages/settings';
import WhatsAppSettings from '@/pages/whatsapp-settings';

function ProtectedShell() {
  return (
    <TrackerProvider>
      <AppLayout />
    </TrackerProvider>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/onboarding" element={<CreateTracker />} />
        <Route element={<ProtectedShell />}>
          <Route path="/" element={<Home />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/whatsapp" element={<WhatsAppSettings />} />
        </Route>
      </Route>
    </Routes>
  );
}
