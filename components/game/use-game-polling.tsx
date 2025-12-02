'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { Game } from '@/lib/types';

interface PollingConfig {
  interval?: number; // milliseconds
  enabled?: boolean;
}

interface UseGamePollingResult {
  data: Game | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  mutate: (updater: (current: Game | null) => Game | null) => void;
  isPending: boolean;
}

export function useGamePolling(gameId: string, config: PollingConfig = {}): UseGamePollingResult {
  const { interval = 2000, enabled = true } = config;
  const [serverData, setServerData] = useState<Game | null>(null);
  const [optimisticData, setOptimisticData] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isPending, setIsPending] = useState(false);
  const pendingMutationRef = useRef<number>(0);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/games/${gameId}`);
      if (!res.ok) throw new Error('Failed to fetch game');
      const gameData = await res.json();
      setServerData(gameData);
      // Clear optimistic data when server catches up
      if (pendingMutationRef.current === 0) {
        setOptimisticData(null);
      }
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    if (!enabled) return;

    // Initial fetch
    fetchData();

    // Set up polling
    const intervalId = setInterval(fetchData, interval);

    return () => clearInterval(intervalId);
  }, [gameId, interval, enabled, fetchData]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  // Apply an optimistic update
  const mutate = useCallback((updater: (current: Game | null) => Game | null) => {
    const currentData = optimisticData || serverData;
    const newData = updater(currentData);
    setOptimisticData(newData);
    setIsPending(true);
    pendingMutationRef.current += 1;

    // Auto-clear pending state after a timeout (server should have caught up)
    setTimeout(() => {
      pendingMutationRef.current -= 1;
      if (pendingMutationRef.current === 0) {
        setIsPending(false);
        setOptimisticData(null);
      }
    }, 3000);
  }, [optimisticData, serverData]);

  // Return optimistic data if available, otherwise server data
  const data = optimisticData || serverData;

  return { data, loading, error, refetch, mutate, isPending };
}
