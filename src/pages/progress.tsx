import { useActiveTracker } from '@/hooks/use-active-tracker';
import { useDailyProgress, useWeeklyProgress, useMonthlyProgress } from '@/hooks/use-progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Flame } from 'lucide-react';

function todayStr() {
  return new Intl.DateTimeFormat('en-CA').format(new Date());
}

function DayLabel({ date }: { date: string }) {
  const d = new Date(`${date}T00:00:00Z`);
  return <span>{d.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' })}</span>;
}

export default function ProgressPage() {
  const { activeTracker } = useActiveTracker();
  const trackerId = activeTracker?.id;

  const { data: daily, isLoading: dailyLoading } = useDailyProgress(trackerId, todayStr());
  const { data: weekly, isLoading: weeklyLoading } = useWeeklyProgress(trackerId);
  const { data: monthly, isLoading: monthlyLoading } = useMonthlyProgress(trackerId);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Progress</h1>

      <Tabs defaultValue="today">
        <TabsList className="w-full">
          <TabsTrigger className="flex-1" value="today">Today</TabsTrigger>
          <TabsTrigger className="flex-1" value="weekly">Weekly</TabsTrigger>
          <TabsTrigger className="flex-1" value="monthly">Monthly</TabsTrigger>
        </TabsList>

        <TabsContent value="today">
          {dailyLoading || !daily ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <Card>
              <CardContent className="space-y-4 p-4">
                {daily.members.map((m: any) => (
                  <div key={m.userId} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{m.name}</span>
                      <span className="text-muted-foreground">{m.percent}%</span>
                    </div>
                    <Progress value={m.percent} />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="weekly">
          {weeklyLoading || !weekly ? (
            <Skeleton className="h-56 w-full" />
          ) : (
            <div className="space-y-3">
              {weekly.members.map((m) => (
                <Card key={m.userId}>
                  <CardHeader>
                    <CardTitle className="text-sm">{m.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex justify-between gap-1 p-4 pt-0">
                    {m.days.map((d) => (
                      <div key={d.date} className="flex flex-col items-center gap-1.5">
                        <span className="text-[11px] text-muted-foreground">
                          <DayLabel date={d.date} />
                        </span>
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold"
                          style={{
                            backgroundColor: `hsl(var(--primary) / ${Math.max(d.percent, 8) / 100})`,
                            color: d.percent >= 50 ? 'white' : 'inherit',
                          }}
                        >
                          {d.percent}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="monthly">
          {monthlyLoading || !monthly ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <div className="space-y-3">
              <Card>
                <CardContent className="flex items-center justify-between p-4">
                  <span className="font-medium">Overall (last 30 days)</span>
                  <span className="text-lg font-semibold">{monthly.overallCompletionRate}%</span>
                </CardContent>
              </Card>
              {monthly.habits.map((h) => (
                <Card key={h.habitId}>
                  <CardContent className="space-y-2 p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {h.icon} {h.name}
                      </span>
                      {h.currentStreak > 0 && (
                        <Badge variant="streak">
                          <Flame className="mr-1 h-3 w-3" /> {h.currentStreak} day streak
                        </Badge>
                      )}
                    </div>
                    <Progress value={h.completionRate} />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{h.completionRate}% completion</span>
                      <span>{h.completedDays} / {h.totalDays} days</span>
                      <span>Best: {h.bestStreak}🔥</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
