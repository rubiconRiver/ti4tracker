import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { emitToGame } from '@/lib/socket';
import { findNextActivePlayer } from '@/lib/game-logic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { gameId, playerId, action, turnDurationMs, scoreChange } = body;

    const game = await db.game.findUnique({
      where: { id: gameId },
      include: {
        players: { orderBy: { turnOrder: 'asc' } },
      },
    });

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    const player = playerId ? game.players.find((p) => p.id === playerId) : null;

    const now = new Date();
    const turnStartTime = new Date(game.turnStartedAt).getTime();
    const actualDurationMs = turnDurationMs || (now.getTime() - turnStartTime);

    switch (action) {
      case 'end_turn': {
        if (!player) return NextResponse.json({ error: 'Player not found' }, { status: 404 });

        const previousState = {
          gameCurrentTurn: game.currentTurn,
          gameCurrentPlayerTurnOrder: game.currentPlayerTurnOrder,
          gameTurnStartedAt: game.turnStartedAt.toISOString(),
          gameStatus: game.status,
          playerTotalTimeMs: player.totalTimeMs,
        };

        await db.turnHistory.create({
          data: {
            gameId,
            playerId: player.id,
            playerName: player.name,
            playerColor: player.color,
            roundNumber: game.currentRound,
            turnNumber: game.currentTurn,
            turnStartedAt: game.turnStartedAt,
            turnEndedAt: now,
            turnDurationMs: actualDurationMs,
            action: 'end_turn',
            previousState,
          },
        });

        await db.player.update({
          where: { id: player.id },
          data: { totalTimeMs: player.totalTimeMs + actualDurationMs },
        });

        const updatedPlayers = await db.player.findMany({
          where: { gameId },
          orderBy: { turnOrder: 'asc' },
        });

        const nextPlayer = findNextActivePlayer(updatedPlayers, player.turnOrder);

        const updatedGame = await db.game.update({
          where: { id: gameId },
          data: {
            currentTurn: game.currentTurn + 1,
            currentPlayerTurnOrder: nextPlayer?.turnOrder ?? game.currentPlayerTurnOrder,
            turnStartedAt: now,
          },
          include: { players: { orderBy: { turnOrder: 'asc' } } },
        });

        emitToGame(gameId, 'turn-ended', { game: updatedGame });
        return NextResponse.json({ game: updatedGame });
      }

      case 'pass': {
        if (!player) return NextResponse.json({ error: 'Player not found' }, { status: 404 });

        const previousState = {
          gameCurrentTurn: game.currentTurn,
          gameCurrentPlayerTurnOrder: game.currentPlayerTurnOrder,
          gameTurnStartedAt: game.turnStartedAt.toISOString(),
          gameStatus: game.status,
          playerTotalTimeMs: player.totalTimeMs,
          playerHasPassed: player.hasPassed,
        };

        await db.turnHistory.create({
          data: {
            gameId,
            playerId: player.id,
            playerName: player.name,
            playerColor: player.color,
            roundNumber: game.currentRound,
            turnNumber: game.currentTurn,
            turnStartedAt: game.turnStartedAt,
            turnEndedAt: now,
            turnDurationMs: actualDurationMs,
            action: 'pass',
            previousState,
          },
        });

        await db.player.update({
          where: { id: player.id },
          data: {
            totalTimeMs: player.totalTimeMs + actualDurationMs,
            hasPassed: true,
          },
        });

        const updatedPlayers = await db.player.findMany({
          where: { gameId },
          orderBy: { turnOrder: 'asc' },
        });

        const allPassed = updatedPlayers.every((p) => p.hasPassed);

        if (allPassed) {
          const updatedGame = await db.game.update({
            where: { id: gameId },
            data: { status: 'paused' },
            include: { players: { orderBy: { turnOrder: 'asc' } } },
          });
          emitToGame(gameId, 'all-passed', { game: updatedGame });
          return NextResponse.json({ game: updatedGame });
        }

        const nextPlayer = findNextActivePlayer(updatedPlayers, player.turnOrder);

        const updatedGame = await db.game.update({
          where: { id: gameId },
          data: {
            currentTurn: game.currentTurn + 1,
            currentPlayerTurnOrder: nextPlayer?.turnOrder ?? game.currentPlayerTurnOrder,
            turnStartedAt: now,
          },
          include: { players: { orderBy: { turnOrder: 'asc' } } },
        });

        emitToGame(gameId, 'turn-ended', { game: updatedGame });
        return NextResponse.json({ game: updatedGame });
      }

      case 'score_change': {
        if (!player) return NextResponse.json({ error: 'Player not found' }, { status: 404 });
        if (typeof scoreChange !== 'number') {
          return NextResponse.json({ error: 'scoreChange required' }, { status: 400 });
        }

        const previousState = {
          playerScore: player.score,
        };

        await db.turnHistory.create({
          data: {
            gameId,
            playerId: player.id,
            playerName: player.name,
            playerColor: player.color,
            roundNumber: game.currentRound,
            turnNumber: game.currentTurn,
            turnStartedAt: game.turnStartedAt,
            action: 'score_change',
            previousState,
          },
        });

        await db.player.update({
          where: { id: player.id },
          data: { score: player.score + scoreChange },
        });

        const updatedGame = await db.game.findUnique({
          where: { id: gameId },
          include: { players: { orderBy: { turnOrder: 'asc' } } },
        });

        emitToGame(gameId, 'action-performed', { action: 'score_change', game: updatedGame });
        return NextResponse.json({ game: updatedGame });
      }

      case 'use_strategy_card': {
        if (!player) return NextResponse.json({ error: 'Player not found' }, { status: 404 });

        const previousState = {
          playerHasUsedStrategyCard: player.hasUsedStrategyCard,
        };

        await db.turnHistory.create({
          data: {
            gameId,
            playerId: player.id,
            playerName: player.name,
            playerColor: player.color,
            roundNumber: game.currentRound,
            turnNumber: game.currentTurn,
            turnStartedAt: game.turnStartedAt,
            action: 'use_strategy_card',
            previousState,
          },
        });

        await db.player.update({
          where: { id: player.id },
          data: { hasUsedStrategyCard: true },
        });

        const updatedGame = await db.game.findUnique({
          where: { id: gameId },
          include: { players: { orderBy: { turnOrder: 'asc' } } },
        });

        emitToGame(gameId, 'action-performed', { action: 'use_strategy_card', game: updatedGame });
        return NextResponse.json({ game: updatedGame });
      }

      case 'start_secondary': {
        if (!player) return NextResponse.json({ error: 'Player not found' }, { status: 404 });

        const previousState = {
          gameStatus: game.status,
          gameSecondaryCardNumber: game.secondaryCardNumber,
          gameSecondaryPlayerId: game.secondaryPlayerId,
        };

        await db.turnHistory.create({
          data: {
            gameId,
            playerId: player.id,
            playerName: player.name,
            playerColor: player.color,
            roundNumber: game.currentRound,
            turnNumber: game.currentTurn,
            turnStartedAt: game.turnStartedAt,
            action: 'start_secondary',
            previousState,
          },
        });

        const updatedGame = await db.game.update({
          where: { id: gameId },
          data: {
            status: 'secondary_resolution',
            secondaryCardNumber: player.strategyCard,
            secondaryPlayerId: player.id,
          },
          include: { players: { orderBy: { turnOrder: 'asc' } } },
        });

        emitToGame(gameId, 'secondary-started', { game: updatedGame });
        return NextResponse.json({ game: updatedGame });
      }

      case 'end_secondary': {
        const previousState = {
          gameStatus: game.status,
          gameSecondaryCardNumber: game.secondaryCardNumber,
          gameSecondaryPlayerId: game.secondaryPlayerId,
        };

        // Use the secondary initiator as the player for the history entry
        const secondaryPlayer = game.players.find(p => p.id === game.secondaryPlayerId);

        await db.turnHistory.create({
          data: {
            gameId,
            playerId: secondaryPlayer?.id ?? playerId ?? game.players[0].id,
            playerName: secondaryPlayer?.name ?? 'Unknown',
            playerColor: secondaryPlayer?.color ?? 'gray',
            roundNumber: game.currentRound,
            turnNumber: game.currentTurn,
            turnStartedAt: game.turnStartedAt,
            action: 'end_secondary',
            previousState,
          },
        });

        const updatedGame = await db.game.update({
          where: { id: gameId },
          data: {
            status: 'active',
            secondaryCardNumber: null,
            secondaryPlayerId: null,
          },
          include: { players: { orderBy: { turnOrder: 'asc' } } },
        });

        emitToGame(gameId, 'secondary-ended', { game: updatedGame });
        return NextResponse.json({ game: updatedGame });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error) {
    console.error('Error processing action:', error);
    return NextResponse.json({ error: 'Failed to process action' }, { status: 500 });
  }
}
