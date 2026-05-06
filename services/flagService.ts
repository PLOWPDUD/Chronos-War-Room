
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
    'rome': 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Vexilloid_of_the_Roman_Empire.svg',
    'roman empire': 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Vexilloid_of_the_Roman_Empire.svg',
    'austria': 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Flag_of_the_Habsburg_Monarchy_%281815%E2%80%931867%29.svg',
    'austrian empire': 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Flag_of_the_Habsburg_Monarchy_%281815%E2%80%931867%29.svg',
    'german empire': 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Flag_of_the_German_Empire.svg',
    'imperial germany': 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Flag_of_the_German_Empire.svg',
    'regency of algiers': 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Flag_of_the_Regency_of_Algiers.svg',
    'ottoman empire': 'https://upload.wikimedia.org/wikipedia/commons/8/84/Flag_of_the_Ottoman_Empire.svg',
    'byzantine empire': 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Flag_of_the_Palaiologos_Dynasty.svg',
    'holy roman empire': 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Banner_of_the_Holy_Roman_Emperor_with_haloes_%281400-1806%29.svg',
    'qing dynasty': 'https://upload.wikimedia.org/wikipedia/commons/b/b5/Flag_of_the_Qing_Dynasty_%281889-1912%29.svg',
    'spanish empire': 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Flag_of_Cross_of_Burgundy.svg',
    'british empire': 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Flag_of_the_United_Kingdom.svg',
    'french empire': 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Flag_of_France.svg',
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
    const cachedFlag = getUrl(knownFlags[lowerFaction]);
    flagCache[cacheKey] = cachedFlag;
    return cachedFlag;
  }

  // Try fuzzy match (if the faction name contains any of our keys)
  for (const key in knownFlags) {
    if (lowerFaction === key || lowerFaction.includes(key + ' ') || lowerFaction.includes(' ' + key)) {
      const cachedFlag = getUrl(knownFlags[key]);
      flagCache[cacheKey] = cachedFlag;
      return cachedFlag;
    }
  }

  // Generate a deterministic SVG flag for fictional or unknown factions
  const generateFictionalFlag = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    const primaryColor = "#" + "00000".substring(0, 6 - c.length) + c;
    const secondaryColor = "#" + (0xFFFFFF ^ (hash & 0x00FFFFFF)).toString(16).padStart(6, '0');
    
    const letter = name.charAt(0).toUpperCase();
    
    // Add visual variety using shapes
    const shapeType = ((hash % 3) + 3) % 3;
    let shapeSvg = '';
    
    if (shapeType === 0) {
      shapeSvg = `<circle cx="150" cy="100" r="60" fill="${secondaryColor}" fill-opacity="0.3" />`;
    } else if (shapeType === 1) {
      shapeSvg = `<rect x="75" y="50" width="150" height="100" fill="${secondaryColor}" fill-opacity="0.3" />`;
    } else {
      shapeSvg = `<polygon points="150,30 230,170 70,170" fill="${secondaryColor}" fill-opacity="0.3" />`;
    }
    
    const svg = `
      <svg width="300" height="200" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
        <rect width="300" height="200" fill="${primaryColor}" />
        <path d="M0 0 L300 200 M300 0 L0 200" stroke="white" stroke-width="20" stroke-opacity="0.1" />
        ${shapeSvg}
        <text x="50%" y="55%" font-family="serif" font-size="100" fill="white" text-anchor="middle" dominant-baseline="central" font-weight="bold" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.3)">${letter}</text>
        <rect width="300" height="200" fill="none" stroke="black" stroke-width="2" stroke-opacity="0.2" />
      </svg>
    `.trim();
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  // Attempt dynamic fetching from Wikimedia Commons for unknown historical factions
  const fetchWikiFlag = async (name: string): Promise<string | null> => {
    try {
      // Step 1: Search for exactly "Flag of {name}"
      const searchRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent('Flag of ' + name)}&utf8=&format=json&origin=*&srlimit=1`);
      const searchData = await searchRes.json();

      let title = '';
      if (searchData.query?.search?.length > 0) {
        title = searchData.query.search[0].title;
      }
      
      if (!title) return null;

      // Ensure the title is somewhat related to a flag
      if (!title.toLowerCase().includes('flag') && !title.toLowerCase().includes('banner')) {
          return null;
      }

      // Get the image
      const imageRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&titles=${encodeURIComponent(title)}&pithumbsize=300&format=json&origin=*`);
      const imageData = await imageRes.json();
      const pages = imageData.query?.pages;
      
      if (pages) {
        const pageId = Object.keys(pages)[0];
        if (pages[pageId]?.thumbnail?.source) {
          return pages[pageId].thumbnail.source;
        }
      }
      
      return null;
    } catch (e) {
      console.warn("Wikimedia fetch failed for", name, e);
      return null; 
    }
  };

  // Skip dynamic fetching if it looks like a purely procedural or fictional name
  const isLikelyReal = /[a-zA-Z]{4,}/.test(normalizedFaction);
  
  if (isLikelyReal) {
    const wikiFlag = await fetchWikiFlag(normalizedFaction);
    if (wikiFlag) {
      flagCache[cacheKey] = wikiFlag;
      return wikiFlag;
    }
  }

  // Fallback to fictional wrapper
  const generatedFlag = generateFictionalFlag(faction);
  flagCache[cacheKey] = generatedFlag;
  return generatedFlag;
};
