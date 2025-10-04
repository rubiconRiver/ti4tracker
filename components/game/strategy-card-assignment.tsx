'use client';

import { useState } from 'react';
import { STRATEGY_CARDS, getStrategyCardColor } from '@/lib/strategy-cards';

interface Player {
  id: string;
  name: string;
  color: string;
  strategyCard: number | null;
  hasSpeaker: boolean;
}

interface Props {
  gameId: string;
  players: Player[];
  currentRound: number;
  onAssigned: () => void;
}

export default function StrategyCardAssignment({ gameId, players, currentRound, onAssigned }: Props) {
  const [assignments, setAssignments] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);

  const assignedCards = new Set(Object.values(assignments));
  const allAssigned = players.every((p) => assignments[p.id] !== undefined);

  const assignCard = (playerId: string, cardNumber: number) => {
    setAssignments({ ...assignments, [playerId]: cardNumber });
  };

  const clearCard = (playerId: string) => {
    const newAssignments = { ...assignments };
    delete newAssignments[playerId];
    setAssignments(newAssignments);
  };

  const submitAssignments = async () => {
    if (!allAssigned) return;

    setSubmitting(true);
    try {
      const strategyAssignments = Object.entries(assignments).map(([playerId, cardNumber]) => ({
        playerId,
        cardNumber,
      }));

      await fetch('/api/rounds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, strategyAssignments }),
      });

      onAssigned();
      setAssignments({});
    } catch (error) {
      console.error('Error assigning strategy cards:', error);
      alert('Failed to assign strategy cards');
    } finally {
      setSubmitting(false);
    }
  };

  const speakerPlayer = players.find((p) => p.hasSpeaker);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 text-black">Strategy Card Assignment - Round {currentRound}</h2>

      {speakerPlayer && (
        <div className="mb-4 p-3 bg-yellow-100 rounded-lg">
          <span className="font-medium text-black">Speaker: {speakerPlayer.name}</span>
        </div>
      )}

      <div className="space-y-4 mb-6">
        {players.map((player) => {
          const assignedCard = assignments[player.id];
          return (
            <div key={player.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-bold text-black">{player.name}</div>
                  {assignedCard && (
                    <div className="text-sm text-gray-600">
                      {STRATEGY_CARDS.find((c) => c.number === assignedCard)?.name}
                    </div>
                  )}
                </div>
                {assignedCard && (
                  <button
                    onClick={() => clearCard(player.id)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="grid grid-cols-4 gap-2">
                {STRATEGY_CARDS.map((card) => {
                  const isAssignedToOther = assignedCards.has(card.number) && assignments[player.id] !== card.number;
                  const isAssignedToThis = assignments[player.id] === card.number;

                  return (
                    <button
                      key={card.number}
                      onClick={() => assignCard(player.id, card.number)}
                      disabled={isAssignedToOther}
                      className={`px-3 py-2 rounded-lg font-medium text-white text-sm transition-all ${
                        card.color
                      } ${
                        isAssignedToThis
                          ? 'ring-2 ring-offset-2 ring-black'
                          : isAssignedToOther
                          ? 'opacity-30 cursor-not-allowed'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      {card.number}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={submitAssignments}
        disabled={!allAssigned || submitting}
        className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? 'Assigning...' : 'Start Round'}
      </button>
    </div>
  );
}
