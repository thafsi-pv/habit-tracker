import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DashboardResponse } from '@/types';

export function GroupProgress({ members }: { members: DashboardResponse['groupProgress'] }) {
  if (members.length <= 1) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Group Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {members.map((m) => (
          <div key={m.userId} className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback>{m.name.slice(0, 1).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{m.name}</span>
              <span className="ml-auto text-sm text-muted-foreground">{m.percent}%</span>
            </div>
            <Progress value={m.percent} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
