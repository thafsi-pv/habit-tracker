import * as React from 'react';
import toast from 'react-hot-toast';
import {
  useTracker,
  useUpdateHabit,
  useDeleteHabit,
  useCreateSubtask,
  useUpdateSubtask,
  useDeleteSubtask,
} from '@/hooks/use-trackers';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, ListPlus, Settings2, Pencil, Check, X } from 'lucide-react';
import type { Habit, Subtask } from '@/types';

function SubtaskItem({ subtask, trackerId }: { subtask: Subtask; trackerId: string }) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [name, setName] = React.useState(subtask.name);
  const updateSubtask = useUpdateSubtask(trackerId);
  const deleteSubtask = useDeleteSubtask(trackerId);

  const handleSave = async () => {
    if (!name.trim()) return;
    try {
      await updateSubtask.mutateAsync({ subtaskId: subtask.id, name: name.trim() });
      setIsEditing(false);
      toast.success('Subtask updated');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to update subtask');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSubtask.mutateAsync(subtask.id);
      toast.success('Subtask removed');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to delete subtask');
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1.5 py-1">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-8 text-sm flex-1"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') {
              setName(subtask.name);
              setIsEditing(false);
            }
          }}
        />
        <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-600 hover:text-emerald-700" onClick={handleSave}>
          <Check className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-muted-foreground"
          onClick={() => {
            setName(subtask.name);
            setIsEditing(false);
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <li className="flex items-center justify-between group py-1 px-2 rounded-md hover:bg-muted/50 text-sm">
      <span className="text-foreground/90">• {subtask.name}</span>
      <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={() => setIsEditing(true)}
          aria-label="Edit subtask"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive/80 hover:text-destructive"
          onClick={handleDelete}
          aria-label="Delete subtask"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </li>
  );
}

function HabitItem({ habit, trackerId }: { habit: Habit; trackerId: string }) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [name, setName] = React.useState(habit.name);
  const [icon, setIcon] = React.useState(habit.icon || '');
  const updateHabit = useUpdateHabit(trackerId);
  const deleteHabit = useDeleteHabit(trackerId);

  const handleSave = async () => {
    if (!name.trim()) return;
    try {
      await updateHabit.mutateAsync({ habitId: habit.id, name: name.trim(), icon: icon.trim() || undefined });
      setIsEditing(false);
      toast.success('Habit updated');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to update habit');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteHabit.mutateAsync(habit.id);
      toast.success('Habit removed');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to delete habit');
    }
  };

  return (
    <div className="space-y-2 rounded-xl border bg-card p-3 shadow-sm">
      {isEditing ? (
        <div className="flex items-center gap-2">
          <Input
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="Icon (e.g. 🏃 or dumbbell)"
            className="h-9 w-24 text-center"
          />
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Habit name"
            className="h-9 flex-1"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') {
                setName(habit.name);
                setIcon(habit.icon || '');
                setIsEditing(false);
              }
            }}
          />
          <Button size="icon" variant="ghost" className="h-9 w-9 text-emerald-600 hover:text-emerald-700" onClick={handleSave}>
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-9 w-9 text-muted-foreground"
            onClick={() => {
              setName(habit.name);
              setIcon(habit.icon || '');
              setIsEditing(false);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium">
            {habit.icon && <span className="text-lg">{habit.icon}</span>}
            <span className="text-base">{habit.name}</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              aria-label={`Edit ${habit.name}`}
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive/80 hover:text-destructive"
              aria-label={`Delete ${habit.name}`}
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {habit.subtasks && habit.subtasks.length > 0 && (
        <ul className="space-y-0.5 pl-1">
          {habit.subtasks.map((s) => (
            <SubtaskItem key={s.id} subtask={s} trackerId={trackerId} />
          ))}
        </ul>
      )}

      <SubtaskAdder habitId={habit.id} trackerId={trackerId} />
    </div>
  );
}

function SubtaskAdder({ habitId, trackerId }: { habitId: string; trackerId: string }) {
  const [name, setName] = React.useState('');
  const createSubtask = useCreateSubtask(trackerId);

  return (
    <form
      className="flex gap-2 pt-1"
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
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Add subtask…"
        className="h-8 text-sm"
      />
      <Button type="submit" size="sm" variant="outline" className="h-8 px-2.5">
        <ListPlus className="h-4 w-4" />
      </Button>
    </form>
  );
}

export function ManageHabitsDialog({ trackerId }: { trackerId: string }) {
  const [open, setOpen] = React.useState(false);
  const { data: tracker } = useTracker(trackerId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <Settings2 className="h-4 w-4 mr-2" /> Manage Habits
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage Habits & Subtasks</DialogTitle>
        </DialogHeader>
        <div className="space-y-3.5 pt-2">
          {(tracker?.habits ?? []).map((h: Habit) => (
            <HabitItem key={h.id} habit={h} trackerId={trackerId} />
          ))}
          {(tracker?.habits ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              No habits yet — add one from the home screen.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
