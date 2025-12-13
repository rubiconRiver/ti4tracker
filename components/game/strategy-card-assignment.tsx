'use client';

import { useState } from 'react';
import { STRATEGY_CARDS } from '@/lib/strategy-cards';
import { getPlayerColor, type PlayerColorId } from '@/lib/design-system/tokens/colors';
import { Crown, Rocket, X } from 'lucide-react';
import type { Player } from '@/lib/types';

interface Props {
  gameId: string;
  players: Player[];
  currentRound: number;
  onAssigned: () => void;
  adminPin?: string;
}

export default function StrategyCardAssignment({ gameId, players, currentRound, onAssigned, adminPin }: Props) {
  const [assignments, setAssignments] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  const assignedCards = new Set(Object.values(assignments));
  const allAssigned = players.every((p) => assignments[p.id] !== undefined);
  const assignedCount = Object.keys(assignments).length;

  const assignCard = (playerId: string, cardNumber: number) => {
    setAssignments({ ...assignments, [playerId]: cardNumber });
    setSelectedPlayer(null);
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
        body: JSON.stringify({ gameId, strategyAssignments, adminPin }),
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
    <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-700 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white">Strategy Selection</h2>
          <p className="text-gray-400 mt-1">Round {currentRound}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-400">Progress</div>
          <div className="flex gap-1">
            {players.map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-all ${
                  i < assignedCount ? 'bg-green-500' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
          <div className="text-sm font-medium text-white">
            {assignedCount}/{players.length}
          </div>
        </div>
      </div>

      {/* Speaker Banner */}
      {speakerPlayer && (
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-yellow-500/20 to-amber-500/10 border border-yellow-500/30 animate-speaker-glow">
          <div className="flex items-center gap-3">
            <Crown className="w-7 h-7 text-yellow-400" />
            <div>
              <div className="text-yellow-400 text-sm font-medium">Speaker</div>
              <div className="text-white font-bold text-lg">{speakerPlayer.name}</div>
            </div>
            <div className="ml-auto text-yellow-400/70 text-sm">Picks first</div>
          </div>
        </div>
      )}

      {/* Player Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        {players.map((player, index) => {
          const assignedCard = assignments[player.id];
          const cardData = assignedCard ? STRATEGY_CARDS.find(c => c.number === assignedCard) : null;
          const colors = getPlayerColor(player.color as PlayerColorId);
          const isSelected = selectedPlayer === player.id;

          return (
            <div
              key={player.id}
              className={`relative rounded-xl overflow-hidden transition-all duration-300 ${
                isSelected ? 'ring-2 ring-white scale-[1.02]' : ''
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Color accent bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-2 ${colors.bg}`} />

              <div className={`bg-gray-700/80 p-5 pl-6 ${player.hasSpeaker ? 'border border-yellow-500/30' : ''}`}>
                {/* Player Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full ${colors.bg} flex items-center justify-center text-white font-bold text-lg`}>
                      {player.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-white text-xl flex items-center gap-2">
                        {player.name}
                        {player.hasSpeaker && <Crown className="w-4 h-4 text-yellow-400" />}
                      </div>
                      {player.faction && (
                        <div className="text-sm text-gray-400">{player.faction}</div>
                      )}
                    </div>
                  </div>

                  {assignedCard && (
                    <button
                      onClick={() => clearCard(player.id)}
                      className="text-sm text-gray-400 hover:text-red-400 transition-colors px-3 py-1 rounded-lg hover:bg-red-500/10"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Assigned Card Display or Selection Trigger */}
                {assignedCard && cardData ? (
                  <div
                    className={`${cardData.gradient} rounded-xl p-4 shadow-lg ${cardData.glow} shadow-lg cursor-pointer hover:scale-[1.02] transition-transform`}
                    onClick={() => setSelectedPlayer(isSelected ? null : player.id)}
                  >
                    <div className="flex items-center gap-4">
                      <cardData.Icon className="w-8 h-8 text-white" />
                      <div>
                        <div className="text-white/70 text-sm">Strategy Card</div>
                        <div className="text-white font-bold text-xl">
                          {cardData.number}. {cardData.name}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedPlayer(isSelected ? null : player.id)}
                    className={`w-full rounded-xl p-4 border-2 border-dashed transition-all ${
                      isSelected
                        ? 'border-white bg-white/10'
                        : 'border-gray-500 hover:border-gray-400 hover:bg-gray-600/50'
                    }`}
                  >
                    <div className="text-gray-400 font-medium">
                      {isSelected ? 'Select a card below...' : 'Tap to assign card'}
                    </div>
                  </button>
                )}

                {/* Card Selection Grid - Shows when player is selected */}
                {isSelected && (
                  <div className="mt-4 grid grid-cols-4 gap-2 animate-slide-up">
                    {STRATEGY_CARDS.map((card) => {
                      const isAssignedToOther = assignedCards.has(card.number) && assignments[player.id] !== card.number;
                      const isAssignedToThis = assignments[player.id] === card.number;

                      return (
                        <button
                          key={card.number}
                          onClick={() => !isAssignedToOther && assignCard(player.id, card.number)}
                          disabled={isAssignedToOther}
                          className={`relative rounded-lg p-3 transition-all ${card.gradient} ${
                            isAssignedToThis
                              ? `ring-2 ring-white shadow-lg ${card.glow}`
                              : isAssignedToOther
                              ? 'opacity-20 cursor-not-allowed grayscale'
                              : 'opacity-80 hover:opacity-100 hover:scale-105'
                          }`}
                        >
                          <div className="text-center">
                            <card.Icon className="w-5 h-5 text-white mx-auto mb-1" />
                            <div className="text-white font-bold text-lg">{card.number}</div>
                            <div className="text-white/80 text-xs truncate">{card.name}</div>
                          </div>
                          {isAssignedToOther && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <X className="w-6 h-6 text-white/50" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Start Round Button */}
      <button
        onClick={submitAssignments}
        disabled={!allAssigned || submitting}
        className={`w-full py-5 rounded-xl font-bold text-xl transition-all ${
          allAssigned && !submitting
            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-400 hover:to-emerald-500 animate-pulse-ready'
            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
        }`}
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-3">
            <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Starting Round...
          </span>
        ) : allAssigned ? (
          <span className="flex items-center justify-center gap-2">
            <Rocket className="w-5 h-5" />
            Start Round {currentRound}
          </span>
        ) : (
          <span>Assign all cards to continue ({assignedCount}/{players.length})</span>
        )}
      </button>
    </div>
  );
}
