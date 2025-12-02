'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TI4_FACTIONS } from '@/lib/factions';
import { Button, Card, Input, Select, ColorPicker } from '@/components/ui';
import { type PlayerColorId, getPlayerColor, PLAYER_COLOR_LIST } from '@/lib/design-system/tokens/colors';

interface Player {
  name: string;
  color: PlayerColorId;
  faction: string;
}

export default function NewGame() {
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([
    { name: '', color: 'red', faction: '' },
  ]);
  const [speakerIndex, setSpeakerIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const usedColors = new Set(players.map((p) => p.color));

  const addPlayer = () => {
    const availableColor = PLAYER_COLOR_LIST.find((c) => !usedColors.has(c.id))?.id || 'red';
    setPlayers([...players, { name: '', color: availableColor as PlayerColorId, faction: '' }]);
  };

  const removePlayer = (index: number) => {
    const newPlayers = players.filter((_, i) => i !== index);
    setPlayers(newPlayers);
    // Adjust speaker index if needed
    if (speakerIndex >= newPlayers.length) {
      setSpeakerIndex(Math.max(0, newPlayers.length - 1));
    } else if (speakerIndex > index) {
      setSpeakerIndex(speakerIndex - 1);
    }
  };

  const updatePlayer = (index: number, field: keyof Player, value: string) => {
    const updated = [...players];
    updated[index] = { ...updated[index], [field]: value };
    setPlayers(updated);
  };

  const createGame = async () => {
    setLoading(true);
    try {
      // Create game
      const gameRes = await fetch('/api/games', {
        method: 'POST',
      });
      const game = await gameRes.json();

      // Add players
      for (let i = 0; i < players.length; i++) {
        const player = players[i];
        await fetch('/api/players', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gameId: game.id,
            name: player.name || `Player ${i + 1}`,
            color: player.color,
            faction: player.faction || null,
            turnOrder: i,
            hasSpeaker: i === speakerIndex,
          }),
        });
      }

      // Start the game in paused mode (waiting for strategy cards)
      await fetch(`/api/games/${game.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paused' }),
      });

      router.push(`/game/${game.id}/admin`);
    } catch (error) {
      console.error('Error creating game:', error);
      alert('Failed to create game');
      setLoading(false);
    }
  };

  const factionOptions = TI4_FACTIONS.map((faction) => ({
    value: faction,
    label: faction,
  }));

  const speakerOptions = players.map((player, index) => ({
    value: index.toString(),
    label: player.name || `Player ${index + 1}`,
  }));

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <Link href="/" className="text-gray-400 hover:text-white text-sm transition-colors">
              ← Back to Home
            </Link>
            <h1 className="text-2xl font-bold mt-1">Create New Game</h1>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Players</div>
            <div className="text-2xl font-bold text-primary-500">{players.length}/8</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Player Cards */}
          {players.map((player, index) => {
            const playerColor = getPlayerColor(player.color);
            const otherUsedColors = players
              .filter((_, i) => i !== index)
              .map((p) => p.color) as PlayerColorId[];

            return (
              <Card
                key={index}
                variant="player"
                playerColor={player.color}
                padding="lg"
                className="animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Card Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full ${playerColor.bg} flex items-center justify-center font-bold text-lg ${playerColor.text}`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {player.name || `Player ${index + 1}`}
                      </h3>
                      {index === speakerIndex && (
                        <span className="text-xs text-accent-500 font-medium flex items-center gap-1">
                          <span>👑</span> Speaker
                        </span>
                      )}
                    </div>
                  </div>

                  {players.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removePlayer(index)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      Remove
                    </Button>
                  )}
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Player Name"
                    value={player.name}
                    onChange={(e) => updatePlayer(index, 'name', e.target.value)}
                    placeholder={`Player ${index + 1}`}
                  />

                  <Select
                    label="Faction (optional)"
                    value={player.faction}
                    onChange={(e) => updatePlayer(index, 'faction', e.target.value)}
                    options={factionOptions}
                    placeholder="Select a faction..."
                  />
                </div>

                {/* Color Picker */}
                <div className="mt-6">
                  <ColorPicker
                    label="Player Color"
                    value={player.color}
                    onChange={(color) => updatePlayer(index, 'color', color)}
                    disabledColors={otherUsedColors}
                    size="lg"
                  />
                </div>
              </Card>
            );
          })}

          {/* Add Player Button */}
          <Button
            variant="ghost"
            size="lg"
            fullWidth
            onClick={addPlayer}
            disabled={players.length >= 8}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            Add Player
          </Button>

          {/* Game Settings */}
          <Card variant="glass" padding="lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="text-accent-500">👑</span>
              Game Settings
            </h3>

            <Select
              label="Starting Speaker"
              value={speakerIndex.toString()}
              onChange={(e) => setSpeakerIndex(parseInt(e.target.value, 10))}
              options={speakerOptions}
              placeholder="Select speaker..."
            />
          </Card>

          {/* Start Game Button */}
          <Button
            variant="primary"
            size="xl"
            fullWidth
            onClick={createGame}
            loading={loading}
            disabled={loading || players.length === 0}
            className={players.length > 0 ? 'animate-pulse-ready' : ''}
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          >
            {loading ? 'Creating Game...' : 'Start Game'}
          </Button>
        </div>
      </div>
    </main>
  );
}
