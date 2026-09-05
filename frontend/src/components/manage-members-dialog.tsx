import * as React from 'react';
import toast from 'react-hot-toast';
import { useTrackerMembers, useRemoveMember } from '@/hooks/use-invitations';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, X } from 'lucide-react';

export function ManageMembersDialog({ trackerId }: { trackerId: string }) {
  const [open, setOpen] = React.useState(false);
  const { data: members } = useTrackerMembers(trackerId);
  const removeMember = useRemoveMember(trackerId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <Users className="h-4 w-4" /> Manage Members
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Members</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {(members ?? []).map((m) => (
            <div key={m.id} className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback>{m.user.name.slice(0, 1).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium">{m.user.name}</p>
                <p className="text-xs text-muted-foreground">{m.user.email}</p>
              </div>
              {m.role === 'MASTER' ? (
                <Badge variant="secondary">Master</Badge>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove ${m.user.name}`}
                  onClick={() =>
                    removeMember.mutate(m.userId, { onSuccess: () => toast.success('Member removed') })
                  }
                >
                  <X className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
