export interface ParsedCommand {
  type: 'next_turn' | 'pass_turn' | 'pause' | 'resume' | 'rewind' | 'next_round' | 'reset_turn' | 'set_score' | 'unknown';
  params?: {
    playerName?: string;
    score?: number;
  };
  originalText: string;
}

export function parseVoiceCommand(command: string): ParsedCommand {
  const lower = command.toLowerCase().trim();

  // Next turn / end turn / pass turn
  if (
    lower.includes('next turn') ||
    lower.includes('end turn') ||
    lower.includes('pass turn') ||
    lower === 'next' ||
    lower === 'pass'
  ) {
    return { type: 'next_turn', originalText: command };
  }

  // Pause game
  if (lower.includes('pause')) {
    return { type: 'pause', originalText: command };
  }

  // Resume game
  if (lower.includes('resume') || lower.includes('unpause')) {
    return { type: 'resume', originalText: command };
  }

  // Rewind turn
  if (lower.includes('rewind') || lower.includes('undo')) {
    return { type: 'rewind', originalText: command };
  }

  // Next round
  if (lower.includes('next round')) {
    return { type: 'next_round', originalText: command };
  }

  // Reset turn
  if (lower.includes('reset turn')) {
    return { type: 'reset_turn', originalText: command };
  }

  // Set score - patterns like "set blue player score to 5" or "blue score 5"
  const scorePatterns = [
    /(?:set\s+)?(\w+)(?:\s+player)?\s+score(?:\s+to)?\s+(\d+)/i,
    /(\w+)\s+score\s+(\d+)/i,
    /score\s+(\w+)\s+(\d+)/i,
  ];

  for (const pattern of scorePatterns) {
    const match = lower.match(pattern);
    if (match) {
      return {
        type: 'set_score',
        params: {
          playerName: match[1],
          score: parseInt(match[2], 10),
        },
        originalText: command,
      };
    }
  }

  // Unknown command
  return { type: 'unknown', originalText: command };
}
