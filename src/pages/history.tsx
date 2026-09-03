import { useAuth } from '@/hooks/use-auth';
import { useActiveTracker } from '@/hooks/use-active-tracker';
import { useWeeklyProgress } from '@/hooks/use-progress';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

export default function History() {
  const { user } = useAuth();
  const { activeTracker } = useActiveTracker();
  const { data: weekly, isLoading } = useWeeklyProgress(activeTracker?.id);

  const myDays = weekly?.members.find((m) => m.userId === user?.id)?.days;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">History</h1>
      <p className="text-sm text-muted-foreground">Your last 7 days on {activeTracker?.name}.</p>

      {isLoading || !myDays ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div className="space-y-2">
          {[...myDays].reverse().map((d) => (
            <Card key={d.date}>
              <CardContent className="space-y-1.5 p-4">
                <div className="flex items-baseline justify-between">
                  <span className="font-medium">
                    {new Date(`${d.date}T00:00:00Z`).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                      timeZone: 'UTC',
                    })}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {d.completed} / {d.total} · {d.percent}%
                  </span>
                </div>
                <Progress value={d.percent} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
