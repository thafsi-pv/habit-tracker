import * as React from 'react';
import { ChevronDown, CheckCircle2, Circle, Users, Sparkles, Check, X } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useActiveTracker } from '@/hooks/use-active-tracker';
import { useWeeklyProgress, useDailyProgress } from '@/hooks/use-progress';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { DailyMemberProgress } from '@/types';

function formatDateLabel(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  const now = new Date();
  const todayStr = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())).toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000);
  const yesterdayStr = new Date(Date.UTC(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate())).toISOString().slice(0, 10);

  const formatted = d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });

  let relativeTag: string | null = null;
  if (dateStr === todayStr) relativeTag = 'Today';
  else if (dateStr === yesterdayStr) relativeTag = 'Yesterday';

  return { formatted, relativeTag };
}

function MemberActivityCard({
  member,
  isCurrentUser,
}: {
  member: DailyMemberProgress;
  isCurrentUser: boolean;
}) {
  const isPerfect = member.total > 0 && member.completed === member.total;

  return (
    <div className="rounded-lg border bg-background/80 p-3.5 shadow-sm space-y-3">
      {/* Member Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar className="h-8 w-8">
            {member.avatarUrl && <AvatarImage src={member.avatarUrl} alt={member.name} />}
            <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
              {member.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-1.5 truncate">
            <span className="font-semibold text-sm truncate">{member.name}</span>
            {isCurrentUser && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                You
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isPerfect && (
            <Badge variant="success" className="gap-1 text-[11px] py-0.5">
              <Sparkles className="h-3 w-3" /> Perfect Day
            </Badge>
          )}
          <span className="text-xs font-medium text-muted-foreground">
            {member.completed} / {member.total} ({member.percent}%)
          </span>
        </div>
      </div>

      {/* Mini Progress Bar */}
      <Progress value={member.percent} className="h-1.5" />

      {/* Habits & Tasks breakdown */}
      {member.habits && member.habits.length > 0 ? (
        <div className="space-y-2 pt-1">
          {member.habits.map((habit) => {
            const hasSubtasks = habit.subtasks && habit.subtasks.length > 0;
            const completedSubtasks = habit.subtasks?.filter((s) => s.completed).length ?? 0;

            return (
              <div
                key={habit.id}
                className={cn(
                  'rounded-md p-2.5 text-xs transition-colors border',
                  habit.completed
                    ? 'bg-success/5 border-success/20'
                    : 'bg-muted/30 border-border/50'
                )}
              >
                {/* Habit row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base flex-shrink-0">{habit.icon || '📌'}</span>
                    <span
                      className={cn(
                        'font-medium text-sm truncate',
                        habit.completed && 'text-foreground'
                      )}
                    >
                      {habit.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {hasSubtasks && (
                      <span className="text-[11px] text-muted-foreground mr-1">
                        {completedSubtasks}/{habit.subtasks.length} subtasks
                      </span>
                    )}
                    {habit.completed ? (
                      <Badge variant="success" className="h-5 px-1.5 gap-1 text-[11px]">
                        <Check className="h-3 w-3" /> Done
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="h-5 px-1.5 gap-1 text-[11px] text-muted-foreground">
                        <X className="h-3 w-3" /> Incomplete
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Indented Subtasks */}
                {hasSubtasks && (
                  <div className="mt-2 space-y-1.5 pl-6 border-l-2 border-border/60 ml-2">
                    {habit.subtasks.map((subtask) => (
                      <div
                        key={subtask.id}
                        className="flex items-center justify-between text-xs py-0.5"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {subtask.completed ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                          ) : (
                            <Circle className="h-3.5 w-3.5 text-muted-foreground/50 flex-shrink-0" />
                          )}
                          <span
                            className={cn(
                              'truncate',
                              subtask.completed ? 'text-foreground font-medium' : 'text-muted-foreground'
                            )}
                          >
                            {subtask.name}
                          </span>
                        </div>
                        <span
                          className={cn(
                            'text-[10px]',
                            subtask.completed ? 'text-emerald-600 font-medium dark:text-emerald-400' : 'text-muted-foreground'
                          )}
                        >
                          {subtask.completed ? 'Completed' : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground italic py-1">No habits scheduled for this day.</p>
      )}
    </div>
  );
}

function DayGroupActivity({
  trackerId,
  date,
  currentUserId,
}: {
  trackerId: string;
  date: string;
  currentUserId?: string;
}) {
  const { data, isLoading, error } = useDailyProgress(trackerId, date);

  if (isLoading) {
    return (
      <div className="space-y-3 pt-2">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 text-center text-xs text-destructive">
        Failed to load activity details for this day.
      </div>
    );
  }

  const members = data.members || [];

  if (members.length === 0) {
    return (
      <p className="p-4 text-center text-xs text-muted-foreground">
        No member activity recorded for this day.
      </p>
    );
  }

  // Sort so current user is at top, then other members alphabetically
  const sortedMembers = [...members].sort((a, b) => {
    if (a.userId === currentUserId) return -1;
    if (b.userId === currentUserId) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground px-0.5">
        <span className="flex items-center gap-1.5 font-semibold uppercase tracking-wider">
          <Users className="h-3.5 w-3.5" />
          Group Members Activity ({members.length})
        </span>
      </div>

      <div className="space-y-3">
        {sortedMembers.map((member) => (
          <MemberActivityCard
            key={member.userId}
            member={member}
            isCurrentUser={member.userId === currentUserId}
          />
        ))}
      </div>
    </div>
  );
}

export default function History() {
  const { user } = useAuth();
  const { activeTracker } = useActiveTracker();
  const { data: weekly, isLoading } = useWeeklyProgress(activeTracker?.id);
  const [expandedDate, setExpandedDate] = React.useState<string | null>(null);

  const days = weekly?.days ? [...weekly.days].reverse() : undefined;

  return (
    <div className="space-y-4 max-w-2xl mx-auto pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">History</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Past 7 days activity log for <span className="font-semibold text-foreground">{activeTracker?.name}</span>. Click any day to expand member details.
        </p>
      </div>

      {isLoading || !days ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      ) : days.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            No history recorded yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {days.map((date) => {
            const isExpanded = expandedDate === date;
            const { formatted, relativeTag } = formatDateLabel(date);
            const members = weekly?.members || [];
            const myDay = members
              .find((m) => m.userId === user?.id)
              ?.days?.find((d) => d.date === date);

            const allMembersDay = members
              .map((m) => m.days?.find((d) => d.date === date))
              .filter(Boolean);
            const totalGroupCompleted = allMembersDay.reduce((acc, d) => acc + (d?.completed || 0), 0);
            const totalGroupItems = allMembersDay.reduce((acc, d) => acc + (d?.total || 0), 0);
            const groupPercent = totalGroupItems > 0 ? Math.round((totalGroupCompleted / totalGroupItems) * 100) : 0;

            return (
              <Card
                key={date}
                className={cn(
                  'overflow-hidden transition-all duration-200 border',
                  isExpanded ? 'ring-2 ring-primary/30 border-primary/40 shadow-md' : 'hover:border-border/80'
                )}
              >
                {/* Accordion Header / Trigger */}
                <button
                  type="button"
                  aria-expanded={isExpanded}
                  className="w-full text-left p-4 hover:bg-accent/40 transition-colors focus:outline-none focus-visible:bg-accent/60"
                  onClick={() => setExpandedDate(isExpanded ? null : date)}
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-base">{formatted}</span>
                      {relativeTag && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                          {relativeTag}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-medium text-muted-foreground">
                        {myDay ? `${myDay.completed} / ${myDay.total} · ${myDay.percent}%` : `${groupPercent}% group`}
                      </span>
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 text-muted-foreground transition-transform duration-200',
                          isExpanded && 'rotate-180 text-primary'
                        )}
                      />
                    </div>
                  </div>

                  <Progress
                    value={myDay ? myDay.percent : groupPercent}
                    className="h-2 bg-muted/60"
                  />
                </button>

                {/* Accordion Content */}
                {isExpanded && activeTracker && (
                  <div className="border-t bg-muted/20 p-4 pt-3 transition-all animate-in fade-in-50 duration-200">
                    <DayGroupActivity
                      trackerId={activeTracker.id}
                      date={date}
                      currentUserId={user?.id}
                    />
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
