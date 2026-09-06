import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { MonthlyProgress, WeeklyProgress, DailyProgressResponse } from '@/types';

export function useDailyProgress(trackerId: string | undefined, date: string | null | undefined) {
  return useQuery({
    queryKey: ['progress', trackerId, 'daily', date],
    queryFn: async () => (await api.get<DailyProgressResponse>('/progress/daily', { params: { trackerId, date } })).data,
    enabled: !!trackerId && !!date,
  });
}

export function useWeeklyProgress(trackerId: string | undefined) {
  return useQuery({
    queryKey: ['progress', trackerId, 'weekly'],
    queryFn: async () => (await api.get<WeeklyProgress>('/progress/weekly', { params: { trackerId } })).data,
    enabled: !!trackerId,
  });
}

export function useMonthlyProgress(trackerId: string | undefined) {
  return useQuery({
    queryKey: ['progress', trackerId, 'monthly'],
    queryFn: async () => (await api.get<MonthlyProgress>('/progress/monthly', { params: { trackerId } })).data,
    enabled: !!trackerId,
  });
}
