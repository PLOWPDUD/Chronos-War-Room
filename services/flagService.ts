
import { GoogleGenAI } from "@google/genai";

// Cache for generated flags to avoid redundant API calls
const flagCache: Record<string, string> = {};

export const getFlagForFaction = async (faction: string, year: string): Promise<string> => {
  const cacheKey = `${faction}-${year}`;
  if (flagCache[cacheKey]) return flagCache[cacheKey];

  // Normalize faction name for better matching
  const normalizedFaction = faction.toLowerCase().trim();

  // Check for well-known historical flags (placeholders or static URLs)
  const knownFlags: Record<string, string> = {
    'united kingdom': 'https://upload.wikimedia.org/wikipedia/en/a/ae/Flag_of_the_United_Kingdom.svg',
    'great britain': 'https://upload.wikimedia.org/wikipedia/en/a/ae/Flag_of_the_United_Kingdom.svg',
    'uk': 'https://upload.wikimedia.org/wikipedia/en/a/ae/Flag_of_the_United_Kingdom.svg',
    'usa': 'https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg',
    'united states': 'https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg',
    'america': 'https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg',
    'soviet union': 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Flag_of_the_Soviet_Union.svg',
    'ussr': 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Flag_of_the_Soviet_Union.svg',
    'russia': 'https://upload.wikimedia.org/wikipedia/en/f/f3/Flag_of_Russia.svg',
    'germany': 'https://upload.wikimedia.org/wikipedia/en/b/ba/Flag_of_Germany.svg',
    'nazi germany': 'https://upload.wikimedia.org/wikipedia/commons/7/77/Flag_of_Germany_%281935%E2%80%931945%29.svg',
    'third reich': 'https://upload.wikimedia.org/wikipedia/commons/7/77/Flag_of_Germany_%281935%E2%80%931945%29.svg',
    'japan': 'https://upload.wikimedia.org/wikipedia/en/9/9e/Flag_of_Japan.svg',
    'empire of japan': 'https://upload.wikimedia.org/wikipedia/commons/5/54/Flag_of_the_Imperial_Japanese_Army.svg',
    'france': 'https://upload.wikimedia.org/wikipedia/en/c/c3/Flag_of_France.svg',
    'poland': 'https://upload.wikimedia.org/wikipedia/en/1/12/Flag_of_Poland.svg',
    'italy': 'https://upload.wikimedia.org/wikipedia/en/0/03/Flag_of_Italy.svg',
    'china': 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Flag_of_the_People%27s_Republic_of_China.svg',
    'spain': 'https://upload.wikimedia.org/wikipedia/en/9/9a/Flag_of_Spain.svg',
    'canada': 'https://upload.wikimedia.org/wikipedia/en/c/cf/Flag_of_Canada.svg',
    'australia': 'https://upload.wikimedia.org/wikipedia/en/b/b9/Flag_of_Australia.svg',
    'india': 'https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg',
    'brazil': 'https://upload.wikimedia.org/wikipedia/en/0/05/Flag_of_Brazil.svg',
    'turkey': 'https://upload.wikimedia.org/wikipedia/commons/b/b4/Flag_of_Turkey.svg',
    'ottoman empire': 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Flag_of_the_Ottoman_Empire.svg',
    'austria-hungary': 'https://upload.wikimedia.org/wikipedia/commons/2/29/Flag_of_Austria-Hungary_%281869-1918%29.svg',
    'prussia': 'https://upload.wikimedia.org/wikipedia/commons/5/5b/Flag_of_Prussia_%281892-1918%29.svg',
  };

  // Try exact match first
  if (knownFlags[normalizedFaction]) {
    return knownFlags[normalizedFaction];
  }

  // Try fuzzy match (if the faction name contains any of our keys)
  for (const key in knownFlags) {
    if (normalizedFaction.includes(key)) {
      return knownFlags[key];
    }
  }

  // Generate a deterministic SVG flag for fictional or unknown factions
  // This ensures they look like "flags" rather than random photos
  const generateFictionalFlag = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    const primaryColor = "#" + "00000".substring(0, 6 - c.length) + c;
    const secondaryColor = "#" + (0xFFFFFF ^ (hash & 0x00FFFFFF)).toString(16).padStart(6, '0');
    
    const letter = name.charAt(0).toUpperCase();
    
    const svg = `
      <svg width="300" height="200" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
        <rect width="300" height="200" fill="${primaryColor}" />
        <path d="M0 0 L300 200 M300 0 L0 200" stroke="white" stroke-width="20" stroke-opacity="0.1" />
        <circle cx="150" cy="100" r="60" fill="${secondaryColor}" fill-opacity="0.2" />
        <text x="50%" y="55%" font-family="serif" font-size="100" fill="white" text-anchor="middle" dominant-baseline="central" font-weight="bold" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.3)">${letter}</text>
        <rect width="300" height="200" fill="none" stroke="black" stroke-width="2" stroke-opacity="0.2" />
      </svg>
    `.trim();
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  return generateFictionalFlag(faction);
};
