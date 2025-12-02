// Shared types for the TI4 Tracker application
// These types mirror the Prisma schema but are safe to use on the client

export type GameStatus = 'setup' | 'active' | 'paused' | 'completed';

export interface Player {
  id: string;
  gameId: string;
  name: string;
  color: string;
  faction: string | null;
  turnOrder: number;
  strategyCard: number | null;
  score: number;
  totalTimeMs: number;
  isActive: boolean;
  hasSpeaker: boolean;
  hasPassed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TurnHistory {
  id: string;
  gameId: string;
  playerId: string;
  playerName: string;
  playerColor: string;
  roundNumber: number;
  turnNumber: number;
  turnStartedAt: string;
  turnEndedAt: string | null;
  turnDurationMs: number | null;
  action: string;
  createdAt: string;
}

export interface Game {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: GameStatus;
  currentTurn: number;
  currentRound: number;
  currentPlayerTurnOrder: number;
  speakerPlayerId: string | null;
  turnStartedAt: string;
  players: Player[];
  history?: TurnHistory[];
}

export interface Round {
  id: string;
  gameId: string;
  roundNumber: number;
  startedAt: string;
  endedAt: string | null;
}

export interface StrategyCardPick {
  id: string;
  roundId: string;
  playerId: string;
  cardNumber: number;
  pickOrder: number;
  createdAt: string;
}

// API response types
export interface GameWithPlayers extends Game {
  players: Player[];
}

export interface GameWithHistory extends Game {
  players: Player[];
  history: TurnHistory[];
}

// Action types
export type TurnAction = 'end_turn' | 'pass' | 'rewind';
