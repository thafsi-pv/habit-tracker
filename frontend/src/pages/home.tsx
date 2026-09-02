import { useAuth } from '@/hooks/use-auth';
import { useActiveTracker } from '@/hooks/use-active-tracker';
import { useDashboard, useToggleHabit, useToggleSubtask } from '@/hooks/use-dashboard';
import { HabitCard } from '@/components/habit-card';
import { GroupProgress } from '@/components/group-progress';
import { AddHabitDialog } from '@/components/add-habit-dialog';
import { InviteMemberDialog } from '@/components/invite-member-dialog';
import { PendingInvitations } from '@/components/pending-invitations';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Navigate } from 'react-router-dom';

function todayStr() {
  return new Intl.DateTimeFormat('en-CA').format(new Date());
}

export default function Home() {
  const { user } = useAuth();
  const { activeTracker, isLoading: trackersLoading, trackers } = useActiveTracker();
  const date = todayStr();
  const { data: dashboard, isLoading } = useDashboard(activeTracker?.id, date);
  const toggleHabit = useToggleHabit(activeTracker?.id ?? '', date);
  const toggleSubtask = useToggleSubtask(activeTracker?.id ?? '', date);

  if (!trackersLoading && trackers.length === 0) {
    return <Navigate to="/onboarding" replace />;
  }

  if (isLoading || !dashboard) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  const isMaster = activeTracker?.myRole === 'MASTER';

  return (
    <div className="space-y-5">
      <PendingInvitations />

      <div>
        <h1 className="text-2xl font-semibold">
          Good day, {user?.name.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-muted-foreground">{activeTracker?.name}</p>
      </div>

      <Card>
        <CardContent className="space-y-2 p-4">
          <div className="flex items-baseline justify-between">
            <p className="font-medium">Today's Progress</p>
            <p className="text-sm text-muted-foreground">
              {dashboard.myProgress.completed} / {dashboard.myProgress.total} completed
            </p>
          </div>
          <Progress value={dashboard.myProgress.percent} />
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Your Routine</h2>
        {dashboard.myHabits.length === 0 ? (
          <Card>
            <CardContent className="space-y-3 p-6 text-center">
              <p className="font-medium">No habits yet</p>
              <p className="text-sm text-muted-foreground">
                {isMaster
                  ? 'Create your first habit and start building your routine.'
                  : 'Ask the tracker master to add some habits.'}
              </p>
              {isMaster && activeTracker && <AddHabitDialog trackerId={activeTracker.id} />}
            </CardContent>
          </Card>
        ) : (
          <>
            {dashboard.myHabits.map((h) => (
              <HabitCard
                key={h.id}
                habit={h}
                onToggleHabit={(habitId, completed) => toggleHabit.mutate({ habitId, completed })}
                onToggleSubtask={(subtaskId, completed) => toggleSubtask.mutate({ subtaskId, completed })}
              />
            ))}
            {isMaster && activeTracker && <AddHabitDialog trackerId={activeTracker.id} />}
          </>
        )}
      </div>

      {isMaster && activeTracker && <InviteMemberDialog trackerId={activeTracker.id} />}

      <GroupProgress members={dashboard.groupProgress} />

      {dashboard.groupProgress.length <= 1 && (
        <Card>
          <CardContent className="space-y-2 p-6 text-center">
            <p className="font-medium">No one else has joined yet.</p>
            <p className="text-sm text-muted-foreground">Invite someone to build habits together.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
