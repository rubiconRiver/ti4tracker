interface Player {
  id: string;
  turnOrder: number;
  hasPassed: boolean;
}

/**
 * Find the next player who hasn't passed, starting after the given turn order.
 * Only considers players that actually exist (handles gaps in turn order).
 */
export function findNextActivePlayer(players: Player[], currentTurnOrder: number): Player | null {
  // Sort by turn order (ascending)
  const sorted = [...players].sort((a, b) => a.turnOrder - b.turnOrder);

  // Find players with turn order > current
  const after = sorted.filter(p => p.turnOrder > currentTurnOrder && !p.hasPassed);
  if (after.length > 0) return after[0];

  // Wrap around: find first non-passed player from the beginning
  const fromStart = sorted.filter(p => !p.hasPassed);
  if (fromStart.length > 0) return fromStart[0];

  return null;
}
