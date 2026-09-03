import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Habit, Tracker } from '@/types';

export function useTrackers() {
  return useQuery({
    queryKey: ['trackers'],
    queryFn: async () => (await api.get<Tracker[]>('/trackers')).data,
  });
}

export function useTracker(trackerId: string | undefined) {
  return useQuery({
    queryKey: ['tracker', trackerId],
    queryFn: async () => (await api.get(`/trackers/${trackerId}`)).data,
    enabled: !!trackerId,
  });
}

export function useCreateTracker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => (await api.post<Tracker>('/trackers', { name })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trackers'] }),
  });
}

export function useCreateHabit(trackerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; icon?: string }) =>
      (await api.post<Habit>('/habits', { trackerId, ...input })).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracker', trackerId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateHabit(trackerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ habitId, ...input }: { habitId: string; name?: string; icon?: string; isActive?: boolean }) =>
      (await api.patch(`/habits/${habitId}`, input)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracker', trackerId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteHabit(trackerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (habitId: string) => (await api.delete(`/habits/${habitId}`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracker', trackerId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useCreateSubtask(trackerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ habitId, name }: { habitId: string; name: string }) =>
      (await api.post(`/habits/${habitId}/subtasks`, { name })).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracker', trackerId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
