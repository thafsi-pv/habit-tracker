import { toast } from 'sonner';
import { usePendingInvitations, useAcceptInvitation } from '@/hooks/use-invitations';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';

export function PendingInvitations() {
  const { data: invitations } = usePendingInvitations();
  const accept = useAcceptInvitation();

  if (!invitations || invitations.length === 0) return null;

  return (
    <div className="mb-4 space-y-2">
      {invitations.map((inv) => (
        <Card key={inv.id} className="border-primary/30 bg-accent">
          <CardContent className="flex items-center justify-between gap-3 p-3">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-5 w-5 shrink-0 text-primary" />
              <span>
                <span className="font-medium">{inv.invitedBy?.name ?? 'Someone'}</span> invited you to join{' '}
                <span className="font-medium">{inv.tracker?.name}</span>
              </span>
            </div>
            <Button
              size="sm"
              onClick={() =>
                accept.mutate(inv.id, {
                  onSuccess: () => toast.success(`Joined ${inv.tracker?.name}`),
                  onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Could not accept invite'),
                })
              }
              disabled={accept.isPending}
            >
              Accept
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
