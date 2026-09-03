import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ChevronRight, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useActiveTracker } from '@/hooks/use-active-tracker';
import { useUpdateSettings } from '@/hooks/use-settings';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ManageHabitsDialog } from '@/components/manage-habits-dialog';
import { ManageMembersDialog } from '@/components/manage-members-dialog';
import { InviteMemberDialog } from '@/components/invite-member-dialog';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { useMutation } from '@tanstack/react-query';

export default function Settings() {
  const navigate = useNavigate();
  const { user, refetch } = useAuth();
  const { activeTracker, trackers, setActiveTrackerId } = useActiveTracker();
  const updateSettings = useUpdateSettings();
  const [notificationTime, setNotificationTime] = React.useState(user?.notificationTime ?? '20:00');
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(user?.notificationsEnabled ?? false);
  const [whatsappNumber, setWhatsappNumber] = React.useState(user?.whatsappNumber ?? '');

  const isMaster = activeTracker?.myRole === 'MASTER';

  const saveNotificationPrefs = async () => {
    try {
      await updateSettings.mutateAsync({ notificationTime, notificationsEnabled, whatsappNumber });
      toast.success('Notification settings saved');
    } catch {
      toast.error('Could not save settings');
    }
  };

  const logout = async () => {
    await api.post('/auth/logout');
    refetch();
    navigate('/login', { replace: true });
  };

  const triggerReport = useMutation({
    mutationFn: async (trackerId: string) => {
      await api.post(`/trackers/${trackerId}/trigger-report`);
    },
    onSuccess: () => toast.success('Report triggered successfully!'),
    onError: () => toast.error('Failed to trigger report'),
  });

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <Card>
        <CardContent className="flex items-center gap-3 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-lg font-semibold text-accent-foreground">
            {user?.name.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <p className="font-medium">{user?.name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </CardContent>
      </Card>

      {trackers.length > 1 && (
        <Card>
          <CardHeader><CardTitle>Trackers</CardTitle></CardHeader>
          <CardContent className="space-y-2 p-4 pt-0">
            {trackers.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTrackerId(t.id)}
                className={`w-full rounded-lg border p-3 text-left text-sm ${t.id === activeTracker?.id ? 'border-primary bg-accent' : ''}`}
              >
                {t.name}
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {user?.email === 'thafsi@example.com' && (
        <Link to="/settings/whatsapp">
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <span className="font-medium">WhatsApp System Connection</span>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      )}

      <Card>
        <CardHeader><CardTitle>Daily Report</CardTitle></CardHeader>
        <CardContent className="space-y-4 p-4 pt-0">
          <label className="flex items-center justify-between">
            <span className="text-sm">Send me a WhatsApp report daily</span>
            <input
              type="checkbox"
              className="h-6 w-6"
              checked={notificationsEnabled}
              onChange={(e) => setNotificationsEnabled(e.target.checked)}
            />
          </label>
          <div className="space-y-1.5">
            <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
            <PhoneInput
              id="whatsappNumber"
              international
              defaultCountry="IN"
              value={whatsappNumber}
              onChange={(value) => setWhatsappNumber(value || '')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="time">Report time (Master sets the time)</Label>
            <Input
              id="time"
              type="time"
              value={notificationTime}
              onChange={(e) => setNotificationTime(e.target.value)}
              disabled={!isMaster}
            />
          </div>
          <Button className="w-full" onClick={saveNotificationPrefs} disabled={updateSettings.isPending}>
            Save
          </Button>
        </CardContent>
      </Card>

      {isMaster && activeTracker && (
        <Card>
          <CardHeader><CardTitle>Tracker Management</CardTitle></CardHeader>
          <CardContent className="space-y-2 p-4 pt-0">
            <ManageHabitsDialog trackerId={activeTracker.id} />
            <ManageMembersDialog trackerId={activeTracker.id} />
            <InviteMemberDialog trackerId={activeTracker.id} />
            <Button
              variant="secondary"
              className="w-full"
              disabled={triggerReport.isPending}
              onClick={() => triggerReport.mutate(activeTracker.id)}
            >
              {triggerReport.isPending ? 'Sending Report...' : 'Trigger Report Now'}
            </Button>
          </CardContent>
        </Card>
      )}

      <Button variant="outline" className="w-full" onClick={logout}>
        <LogOut className="h-4 w-4" /> Log out
      </Button>
    </div>
  );
}
