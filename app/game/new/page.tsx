'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const TI4_COLORS = [
  { name: 'Red', value: 'red', bg: 'bg-red-600', text: 'text-white' },
  { name: 'Blue', value: 'blue', bg: 'bg-blue-600', text: 'text-white' },
  { name: 'Green', value: 'green', bg: 'bg-green-600', text: 'text-white' },
  { name: 'Yellow', value: 'yellow', bg: 'bg-yellow-500', text: 'text-black' },
  { name: 'Purple', value: 'purple', bg: 'bg-purple-600', text: 'text-white' },
  { name: 'Black', value: 'black', bg: 'bg-gray-900', text: 'text-white' },
  { name: 'Orange', value: 'orange', bg: 'bg-orange-600', text: 'text-white' },
  { name: 'Pink', value: 'pink', bg: 'bg-pink-600', text: 'text-white' },
];

interface Player {
  name: string;
  color: string;
  faction: string;
}

export default function NewGame() {
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([
    { name: '', color: 'red', faction: '' },
  ]);
  const [loading, setLoading] = useState(false);

  const addPlayer = () => {
    const usedColors = new Set(players.map((p) => p.color));
    const availableColor = TI4_COLORS.find((c) => !usedColors.has(c.value))?.value || 'red';
    setPlayers([...players, { name: '', color: availableColor, faction: '' }]);
  };

  const removePlayer = (index: number) => {
    setPlayers(players.filter((_, i) => i !== index));
  };

  const updatePlayer = (index: number, field: keyof Player, value: string) => {
    const updated = [...players];
    updated[index][field] = value;
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
          }),
        });
      }

      // Start the game
      await fetch(`/api/games/${game.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' }),
      });

      router.push(`/game/${game.id}`);
    } catch (error) {
      console.error('Error creating game:', error);
      alert('Failed to create game');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-black">Create New Game</h1>

        <div className="space-y-6">
          {players.map((player, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-black">Player {index + 1}</h3>
                {players.length > 1 && (
                  <button
                    onClick={() => removePlayer(index)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={player.name}
                  onChange={(e) => updatePlayer(index, 'name', e.target.value)}
                  placeholder={`Player ${index + 1}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {TI4_COLORS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => updatePlayer(index, 'color', color.value)}
                      className={`px-3 py-2 rounded-lg font-medium transition-all ${color.bg} ${color.text} ${
                        player.color === color.value
                          ? 'ring-2 ring-offset-2 ring-gray-900'
                          : 'opacity-50 hover:opacity-100'
                      }`}
                    >
                      {color.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Faction (optional)
                </label>
                <input
                  type="text"
                  value={player.faction}
                  onChange={(e) => updatePlayer(index, 'faction', e.target.value)}
                  placeholder="e.g., The Xxcha Kingdom"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                />
              </div>
            </div>
          ))}

          <button
            onClick={addPlayer}
            disabled={players.length >= 8}
            className="w-full px-4 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Player
          </button>

          <button
            onClick={createGame}
            disabled={loading || players.length === 0}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Start Game'}
          </button>
        </div>
      </div>
    </main>
  );
}
