'use client';

import { useEffect, useState } from 'react';

interface PollingConfig {
  interval?: number; // milliseconds
  enabled?: boolean;
}

export function useGamePolling(gameId: string, config: PollingConfig = {}) {
  const { interval = 2000, enabled = true } = config;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/games/${gameId}`);
        if (!res.ok) throw new Error('Failed to fetch game');
        const gameData = await res.json();
        setData(gameData);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchData();

    // Set up polling
    const intervalId = setInterval(fetchData, interval);

    return () => clearInterval(intervalId);
  }, [gameId, interval, enabled]);

  return { data, loading, error, refetch: () => {} };
}
