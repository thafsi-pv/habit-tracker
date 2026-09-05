import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { DashboardResponse } from '@/types';

export function useDashboard(trackerId: string | undefined, date?: string) {
  return useQuery({
    queryKey: ['dashboard', trackerId, date],
    queryFn: async () =>
      (await api.get<DashboardResponse>('/dashboard/today', { params: { trackerId, date } })).data,
    enabled: !!trackerId,
  });
}

export function useToggleHabit(trackerId: string, date: string) {
  const queryClient = useQueryClient();
  const key = ['dashboard', trackerId, date];

  return useMutation({
    mutationFn: async ({ habitId, completed }: { habitId: string; completed: boolean }) =>
      (await api.patch(`/daily-habits/habit/${habitId}`, { date, completed })).data,
    onMutate: async ({ habitId, completed }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<DashboardResponse>(key);
      if (previous) {
        queryClient.setQueryData<DashboardResponse>(key, {
          ...previous,
          myHabits: previous.myHabits.map((h) => (h.id === habitId ? { ...h, completed } : h)),
        });
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}

export function useToggleSubtask(trackerId: string, date: string) {
  const queryClient = useQueryClient();
  const key = ['dashboard', trackerId, date];

  return useMutation({
    mutationFn: async ({ subtaskId, completed }: { subtaskId: string; completed: boolean }) =>
      (await api.patch(`/daily-habits/subtask/${subtaskId}`, { date, completed })).data,
    onMutate: async ({ subtaskId, completed }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<DashboardResponse>(key);
      if (previous) {
        queryClient.setQueryData<DashboardResponse>(key, {
          ...previous,
          myHabits: previous.myHabits.map((h) => ({
            ...h,
            subtasks: h.subtasks.map((s) => (s.id === subtaskId ? { ...s, completed } : s)),
          })),
        });
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}
