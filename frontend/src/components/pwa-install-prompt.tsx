import { usePWA } from '@/hooks/use-pwa';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';

export function PWAInstallPrompt() {
  const { isInstalled, canInstall, promptInstall } = usePWA();

  if (isInstalled || !canInstall) return null;

  const handleInstall = async () => {
    const accepted = await promptInstall();
    if (accepted) {
      toast.success('App installed successfully!');
    }
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50">
      <div className="bg-card border rounded-lg shadow-lg p-4 flex items-center gap-3">
        <div className="flex-1">
          <p className="text-sm font-medium">Install Habit Tracker</p>
          <p className="text-xs text-muted-foreground">Add to home screen for quick access</p>
        </div>
        <Button size="sm" onClick={handleInstall}>
          <Download className="h-4 w-4 mr-1" />
          Install
        </Button>
      </div>
    </div>
  );
}