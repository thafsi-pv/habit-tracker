import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useWhatsAppStatus } from '@/hooks/use-whatsapp';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function WhatsAppSettings() {
  const { data: status, isLoading, connect, disconnect } = useWhatsAppStatus();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild aria-label="Back">
          <Link to="/settings">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold">WhatsApp</h1>
      </div>

      {isLoading || !status ? (
        <Skeleton className="h-56 w-full" />
      ) : status.status === 'CONNECTED' ? (
        <Card>
          <CardContent className="space-y-4 p-6 text-center">
            <p className="text-lg">🟢 Connected</p>
            <div>
              <p className="text-sm text-muted-foreground">Number</p>
              <p className="font-medium">{status.phoneNumber}</p>
            </div>
            <Button variant="destructive" className="w-full" onClick={() => disconnect.mutate()}>
              {disconnect.isPending ? 'Disconnecting…' : 'Disconnect'}
            </Button>
          </CardContent>
        </Card>
      ) : status.status === 'CONNECTING' ? (
        <Card>
          <CardContent className="space-y-4 p-6 text-center">
            <p className="font-medium">Scan this QR code with WhatsApp</p>
            {status.qr ? (
              <img src={status.qr} alt="WhatsApp QR code" className="mx-auto h-56 w-56 rounded-lg border" />
            ) : (
              <Skeleton className="mx-auto h-56 w-56" />
            )}
            <p className="text-sm text-muted-foreground">Waiting for connection…</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="space-y-4 p-6 text-center">
            <p className="text-lg">🔴 Not connected</p>
            <p className="text-sm text-muted-foreground">
              Connect WhatsApp to receive your daily habit progress.
            </p>
            <Button className="w-full" onClick={() => connect.mutate()} disabled={connect.isPending}>
              {connect.isPending ? 'Starting…' : 'Connect WhatsApp'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
