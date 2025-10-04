export const STRATEGY_CARDS = [
  { number: 1, name: 'Leadership', color: 'bg-purple-600' },
  { number: 2, name: 'Diplomacy', color: 'bg-blue-600' },
  { number: 3, name: 'Politics', color: 'bg-green-600' },
  { number: 4, name: 'Construction', color: 'bg-yellow-600' },
  { number: 5, name: 'Trade', color: 'bg-orange-600' },
  { number: 6, name: 'Warfare', color: 'bg-red-600' },
  { number: 7, name: 'Technology', color: 'bg-cyan-600' },
  { number: 8, name: 'Imperial', color: 'bg-pink-600' },
] as const;

export function getStrategyCardName(number: number): string {
  return STRATEGY_CARDS.find((card) => card.number === number)?.name || `Card ${number}`;
}

export function getStrategyCardColor(number: number): string {
  return STRATEGY_CARDS.find((card) => card.number === number)?.color || 'bg-gray-600';
}
