import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface SettingsInput {
  timezone?: string;
  notificationTime?: string;
  notificationsEnabled?: boolean;
  whatsappNumber?: string;
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: SettingsInput) => (await api.patch('/users/me/settings', input)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me'] }),
  });
}
