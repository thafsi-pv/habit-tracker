import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { io, type Socket } from 'socket.io-client';
import { api } from '@/lib/api';
import type { WhatsAppStatus } from '@/types';

const WS_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export function useWhatsAppStatus() {
  const queryClient = useQueryClient();
  const socketRef = React.useRef<Socket | null>(null);

  const query = useQuery({
    queryKey: ['whatsapp', 'status'],
    queryFn: async () => (await api.get<WhatsAppStatus>('/whatsapp/status')).data,
  });

  React.useEffect(() => {
    const socket = io(`${WS_URL}/whatsapp`, { withCredentials: true, transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('status', (status: WhatsAppStatus) => {
      queryClient.setQueryData(['whatsapp', 'status'], status);
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient]);

  const connect = useMutation({
    mutationFn: async () => (await api.post('/whatsapp/connect')).data,
  });

  const disconnect = useMutation({
    mutationFn: async () => (await api.post('/whatsapp/disconnect')).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['whatsapp', 'status'] }),
  });

  return { ...query, connect, disconnect };
}
