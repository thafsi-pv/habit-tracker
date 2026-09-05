import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { DashboardHabit } from '@/types';

interface Props {
  habit: DashboardHabit;
  onToggleHabit: (habitId: string, completed: boolean) => void;
  onToggleSubtask: (subtaskId: string, completed: boolean) => void;
}

export function HabitCard({ habit, onToggleHabit, onToggleSubtask }: Props) {
  if (habit.subtasks.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-between gap-3 p-4">
          <label htmlFor={`habit-${habit.id}`} className="flex flex-1 items-center gap-3 text-base">
            <span className="text-xl">{habit.icon}</span>
            <span className={cn(habit.completed && 'text-muted-foreground line-through')}>{habit.name}</span>
          </label>
          <Checkbox
            id={`habit-${habit.id}`}
            checked={habit.completed}
            onCheckedChange={(checked) => onToggleHabit(habit.id, checked === true)}
          />
        </CardContent>
      </Card>
    );
  }

  const doneCount = habit.subtasks.filter((s) => s.completed).length;

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center gap-2 text-base font-medium">
          <span className="text-xl">{habit.icon}</span>
          {habit.name}
        </div>
        <div className="space-y-2.5">
          {habit.subtasks.map((s) => (
            <label key={s.id} htmlFor={`sub-${s.id}`} className="flex items-center gap-3 py-1 text-sm">
              <Checkbox
                id={`sub-${s.id}`}
                checked={s.completed}
                onCheckedChange={(checked) => onToggleSubtask(s.id, checked === true)}
              />
              <span className={cn(s.completed && 'text-muted-foreground line-through')}>{s.name}</span>
            </label>
          ))}
        </div>
        <p className="text-xs font-medium text-muted-foreground">
          {doneCount} / {habit.subtasks.length}
        </p>
      </CardContent>
    </Card>
  );
}
