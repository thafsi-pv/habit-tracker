import * as React from 'react';
import { toast } from 'sonner';
import { useTracker } from '@/hooks/use-trackers';
import { useDeleteHabit, useCreateSubtask } from '@/hooks/use-trackers';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, ListPlus, Settings2 } from 'lucide-react';
import type { Habit } from '@/types';

function SubtaskAdder({ habitId, trackerId }: { habitId: string; trackerId: string }) {
  const [name, setName] = React.useState('');
  const createSubtask = useCreateSubtask(trackerId);

  return (
    <form
      className="flex gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        try {
          await createSubtask.mutateAsync({ habitId, name: name.trim() });
          setName('');
        } catch (err: any) {
          toast.error(err?.response?.data?.message ?? 'Could not add subtask');
        }
      }}
    >
      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Add subtask…" className="h-9" />
      <Button type="submit" size="sm" variant="outline">
        <ListPlus className="h-4 w-4" />
      </Button>
    </form>
  );
}

export function ManageHabitsDialog({ trackerId }: { trackerId: string }) {
  const [open, setOpen] = React.useState(false);
  const { data: tracker } = useTracker(trackerId);
  const deleteHabit = useDeleteHabit(trackerId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <Settings2 className="h-4 w-4" /> Manage Habits
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage habits</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {(tracker?.habits ?? []).map((h: Habit) => (
            <div key={h.id} className="space-y-2 rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {h.icon} {h.name}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Delete ${h.name}`}
                  onClick={() =>
                    deleteHabit.mutate(h.id, { onSuccess: () => toast.success('Habit removed') })
                  }
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              {h.subtasks.length > 0 && (
                <ul className="space-y-1 pl-2 text-sm text-muted-foreground">
                  {h.subtasks.map((s) => (
                    <li key={s.id}>• {s.name}</li>
                  ))}
                </ul>
              )}
              <SubtaskAdder habitId={h.id} trackerId={trackerId} />
            </div>
          ))}
          {(tracker?.habits ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">No habits yet — add one from the home screen.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
