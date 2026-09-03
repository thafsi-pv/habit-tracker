import * as React from 'react';
import { useTrackers } from '@/hooks/use-trackers';
import type { Tracker } from '@/types';

interface TrackerContextValue {
  trackers: Tracker[];
  activeTracker: Tracker | undefined;
  setActiveTrackerId: (id: string) => void;
  isLoading: boolean;
}

const TrackerContext = React.createContext<TrackerContextValue | null>(null);

const STORAGE_KEY = 'habit-tracker:active-tracker-id';

export function TrackerProvider({ children }: { children: React.ReactNode }) {
  const { data: trackers, isLoading } = useTrackers();
  const [activeId, setActiveId] = React.useState<string | null>(() => localStorage.getItem(STORAGE_KEY));

  React.useEffect(() => {
    if (!trackers || trackers.length === 0) return;
    const stillExists = trackers.some((t) => t.id === activeId);
    if (!activeId || !stillExists) {
      setActiveId(trackers[0].id);
    }
  }, [trackers, activeId]);

  const setActiveTrackerId = (id: string) => {
    setActiveId(id);
    localStorage.setItem(STORAGE_KEY, id);
  };

  const activeTracker = trackers?.find((t) => t.id === activeId);

  return (
    <TrackerContext.Provider
      value={{ trackers: trackers ?? [], activeTracker, setActiveTrackerId, isLoading }}
    >
      {children}
    </TrackerContext.Provider>
  );
}

export function useActiveTracker() {
  const ctx = React.useContext(TrackerContext);
  if (!ctx) throw new Error('useActiveTracker must be used within TrackerProvider');
  return ctx;
}
