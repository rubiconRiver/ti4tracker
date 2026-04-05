interface Player {
  id: string;
  turnOrder: number;
  hasPassed: boolean;
}

/**
 * Find the next player who hasn't passed, starting after the given turn order.
 * Wraps around from 8 back to 1.
 */
export function findNextActivePlayer(players: Player[], currentTurnOrder: number): Player | null {
  let nextTurnOrder = currentTurnOrder + 1;
  let attempts = 0;

  while (attempts < players.length) {
    if (nextTurnOrder > 8) {
      nextTurnOrder = 1;
    }

    const nextPlayer = players.find(p => p.turnOrder === nextTurnOrder);
    if (nextPlayer && !nextPlayer.hasPassed) {
      return nextPlayer;
    }

    nextTurnOrder++;
    attempts++;
  }

  return null;
}
