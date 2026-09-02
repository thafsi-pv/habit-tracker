import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Invitation, Member } from '@/types';

export function usePendingInvitations() {
  return useQuery({
    queryKey: ['invitations', 'pending'],
    queryFn: async () => (await api.get<Invitation[]>('/invitations/pending')).data,
  });
}

export function useTrackerInvitations(trackerId: string | undefined) {
  return useQuery({
    queryKey: ['invitations', trackerId],
    queryFn: async () => (await api.get<Invitation[]>(`/trackers/${trackerId}/invitations`)).data,
    enabled: !!trackerId,
  });
}

export function useInviteMember(trackerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (email: string) =>
      (await api.post(`/trackers/${trackerId}/invitations`, { email })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invitations', trackerId] }),
  });
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (invitationId: string) => (await api.post(`/invitations/${invitationId}/accept`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations', 'pending'] });
      queryClient.invalidateQueries({ queryKey: ['trackers'] });
    },
  });
}

export function useTrackerMembers(trackerId: string | undefined) {
  return useQuery({
    queryKey: ['members', trackerId],
    queryFn: async () => (await api.get<Member[]>(`/trackers/${trackerId}/members`)).data,
    enabled: !!trackerId,
  });
}

export function useRemoveMember(trackerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => (await api.delete(`/trackers/${trackerId}/members/${userId}`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['members', trackerId] }),
  });
}
