import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useActiveTracker } from '@/hooks/use-active-tracker';
import { useWeeklyProgress } from '@/hooks/use-progress';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

export default function History() {
  const { user } = useAuth();
  const { activeTracker } = useActiveTracker();
  const { data: weekly, isLoading } = useWeeklyProgress(activeTracker?.id);
  const [expandedDate, setExpandedDate] = React.useState<string | null>(null);

  const days = weekly?.days ? [...weekly.days].reverse() : undefined;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">History</h1>
      <p className="text-sm text-muted-foreground">The last 7 days on {activeTracker?.name}.</p>

      {isLoading || !days ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div className="space-y-2">
          {days.map((date) => {
            const isExpanded = expandedDate === date;
            const myDay = weekly.members.find((m) => m.userId === user?.id)?.days?.find(d => d.date === date);

            return (
              <Card key={date} className="overflow-hidden">
                <div
                  className="cursor-pointer p-4 hover:bg-accent/50 transition-colors"
                  onClick={() => setExpandedDate(isExpanded ? null : date)}
                >
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="font-medium">
                      {new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric',
                        timeZone: 'UTC',
                      })}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {myDay ? `${myDay.completed} / ${myDay.total} · ${myDay.percent}%` : 'No data'}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </div>
                  </div>
                  {myDay && <Progress value={myDay.percent} />}
                </div>

                {isExpanded && (
                  <div className="border-t bg-accent/20 p-4 space-y-3">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Group Activity</h4>
                    <div className="space-y-3">
                      {weekly.members.map((m) => {
                        const mDay = m.days.find(d => d.date === date);
                        if (!mDay) return null;
                        return (
                          <div key={m.userId} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">{m.userId === user?.id ? 'You' : m.name}</span>
                              <span className="text-muted-foreground">{mDay.completed} / {mDay.total}</span>
                            </div>
                            <Progress value={mDay.percent} className="h-1.5" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
