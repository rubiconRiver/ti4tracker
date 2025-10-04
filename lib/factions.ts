export const TI4_FACTIONS = [
  'The Arborec',
  'The Argent Flight',
  'The Barony of Letnev',
  'The Clan of Saar',
  'The Embers of Muaat',
  'The Emirates of Hacan',
  'The Federation of Sol',
  'The Ghosts of Creuss',
  'The L1Z1X Mindnet',
  'The Mentak Coalition',
  'The Naalu Collective',
  'The Nekro Virus',
  'Sardakk N\'orr',
  'The Universities of Jol-Nar',
  'The Winnu',
  'The Xxcha Kingdom',
  'The Yin Brotherhood',
  'The Yssaril Tribes',
  // Prophecy of Kings expansions
  'The Council Keleres',
  'The Empyrean',
  'The Mahact Gene-Sorcerers',
  'The Naaz-Rokha Alliance',
  'The Nomad',
  'The Titans of Ul',
  'The Vuil\'raith Cabal',
] as const;

export const FACTION_ICONS: Record<string, string> = {
  'The Arborec': 'https://static.wikia.nocookie.net/twilight-imperium-4/images/8/8f/ArborecSymbolSquare.png',
  'The Argent Flight': 'https://static.wikia.nocookie.net/twilight-imperium-4/images/1/13/ArgentFactionSymbol.png',
  'The Barony of Letnev': 'https://static.wikia.nocookie.net/twilight-imperium-4/images/2/20/Barony.png',
  'The Clan of Saar': 'https://static.wikia.nocookie.net/twilight-imperium-4/images/b/b0/Saar.png',
  'The Embers of Muaat': 'https://static.wikia.nocookie.net/twilight-imperium-4/images/3/37/MuaatSymbolSquare.png',
  'The Emirates of Hacan': 'https://static.wikia.nocookie.net/twilight-imperium-4/images/f/f8/Hacan.png',
  'The Federation of Sol': 'https://static.wikia.nocookie.net/twilight-imperium-4/images/0/01/Sol.png',
  'The Ghosts of Creuss': 'https://static.wikia.nocookie.net/twilight-imperium-4/images/7/7f/Ghosts.png',
  'The L1Z1X Mindnet': 'https://static.wikia.nocookie.net/twilight-imperium-4/images/e/ec/L1Z1X.png',
  'The Mentak Coalition': 'https://static.wikia.nocookie.net/twilight-imperium-4/images/3/3c/Mentak.png',
  'The Naalu Collective': 'https://static.wikia.nocookie.net/twilight-imperium-4/images/a/a7/Naalu.png',
  'The Nekro Virus': 'https://static.wikia.nocookie.net/twilight-imperium-4/images/2/22/Nekro.png',
  'Sardakk N\'orr': 'https://static.wikia.nocookie.net/twilight-imperium-4/images/0/08/SardakkSymbolSquare.png',
  'The Universities of Jol-Nar': 'https://static.wikia.nocookie.net/twilight-imperium-4/images/4/48/JOLNAR.png',
  'The Winnu': 'https://static.wikia.nocookie.net/twilight-imperium-4/images/5/53/WINNU.png',
  'The Xxcha Kingdom': 'https://static.wikia.nocookie.net/twilight-imperium-4/images/7/77/XXCHA.png',
  'The Yin Brotherhood': 'https://static.wikia.nocookie.net/twilight-imperium-4/images/a/a4/YIN.png',
  'The Yssaril Tribes': 'https://static.wikia.nocookie.net/twilight-imperium-4/images/4/47/YSSARIL.png',
  'The Council Keleres': 'https://static.wikia.nocookie.net/twilight-imperium-4/images/7/7f/C3_Icon.png',
  'The Empyrean': 'https://static.wikia.nocookie.net/twilight-imperium-4/images/4/47/EMPYREAN.png',
  'The Mahact Gene-Sorcerers': 'https://static.wikia.nocookie.net/twilight-imperium-4/images/9/9c/MAHACT.png',
  'The Naaz-Rokha Alliance': 'https://static.wikia.nocookie.net/twilight-imperium-4/images/5/5b/NAAZROKHA.png',
  'The Nomad': 'https://static.wikia.nocookie.net/twilight-imperium-4/images/0/0a/NOMAD.png',
  'The Titans of Ul': 'https://static.wikia.nocookie.net/twilight-imperium-4/images/9/9e/TITANS.png',
  'The Vuil\'raith Cabal': 'https://static.wikia.nocookie.net/twilight-imperium-4/images/9/9c/MAHACT.png', // placeholder
};

export function getFactionIcon(faction: string | null): string | null {
  if (!faction) return null;
  return FACTION_ICONS[faction] || null;
}
