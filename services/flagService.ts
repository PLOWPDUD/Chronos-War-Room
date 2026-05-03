
import { GoogleGenAI } from "@google/genai";

// Cache for generated flags to avoid redundant API calls
const flagCache: Record<string, string> = {};

export const getFlagForFaction = async (faction: string, year: string): Promise<string> => {
  const cacheKey = `${faction}-${year}`;
  if (flagCache[cacheKey]) return flagCache[cacheKey];

  // Normalize faction name for better matching
  const normalizedFaction = faction.trim(); // Keep case for URLs/Base64 if needed, though startsWith is fine

  const getUrl = (codeOrUrl: string) => {
    if (codeOrUrl.startsWith('http') || codeOrUrl.startsWith('data:')) return codeOrUrl;
    return `https://flagcdn.com/w80/${codeOrUrl.toLowerCase()}.png`;
  };

  if (normalizedFaction.startsWith('http') || normalizedFaction.startsWith('data:')) {
    return normalizedFaction;
  }

  const lowerFaction = normalizedFaction.toLowerCase();

  // If faction is already a 2-letter ISO code
  if (lowerFaction.length === 2 && /^[a-z]{2}$/.test(lowerFaction)) {
    return getUrl(lowerFaction);
  }

  // Check for well-known historical flags (placeholders or static URLs)
  const knownFlags: Record<string, string> = {
    'united kingdom': 'gb',
    'great britain': 'gb',
    'uk': 'gb',
    'usa': 'us',
    'united states': 'us',
    'america': 'us',
    'soviet union': 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Flag_of_the_Soviet_Union.svg',
    'ussr': 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Flag_of_the_Soviet_Union.svg',
    'russia': 'ru',
    'germany': 'de',
    'nazi germany': 'https://upload.wikimedia.org/wikipedia/commons/7/77/Flag_of_Germany_%281935%E2%80%931945%29.svg',
    'third reich': 'https://upload.wikimedia.org/wikipedia/commons/7/77/Flag_of_Germany_%281935%E2%80%931945%29.svg',
    'japan': 'jp',
    'empire of japan': 'https://upload.wikimedia.org/wikipedia/commons/5/54/Flag_of_the_Imperial_Japanese_Army.svg',
    'france': 'fr',
    'poland': 'pl',
    'italy': 'it',
    'china': 'cn',
    'spain': 'es',
    'canada': 'ca',
    'australia': 'au',
    'india': 'in',
    'brazil': 'br',
    'turkey': 'tr',
    'ottoman empire': 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Flag_of_the_Ottoman_Empire.svg',
    'austria-hungary': 'https://upload.wikimedia.org/wikipedia/commons/2/29/Flag_of_Austria-Hungary_%281869-1918%29.svg',
    'prussia': 'https://upload.wikimedia.org/wikipedia/commons/5/5b/Flag_of_Prussia_%281892-1918%29.svg',
    'algeria': 'dz',
    'egypt': 'eg',
    'israel': 'il',
    'south korea': 'kr',
    'north korea': 'kp',
    'vietnam': 'vn',
    'ukraine': 'ua',
    'belarus': 'by',
    'mexico': 'mx',
    'argentina': 'ar',
    'chile': 'cl',
    'sweden': 'se',
    'norway': 'no',
    'denmark': 'dk',
    'finland': 'fi',
    'netherlands': 'nl',
    'belgium': 'be',
    'switzerland': 'ch',
    'greece': 'gr',
    'portugal': 'pt',
  };

  // Try exact match first
  if (knownFlags[lowerFaction]) {
    return getUrl(knownFlags[lowerFaction]);
  }

  // Try fuzzy match (if the faction name contains any of our keys)
  for (const key in knownFlags) {
    if (lowerFaction.includes(key)) {
      return getUrl(knownFlags[key]);
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
