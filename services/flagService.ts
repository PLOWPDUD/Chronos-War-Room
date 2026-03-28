
import { GoogleGenAI } from "@google/genai";

// Cache for generated flags to avoid redundant API calls
const flagCache: Record<string, string> = {};

export const getFlagForFaction = async (faction: string, year: string): Promise<string> => {
  const cacheKey = `${faction}-${year}`;
  if (flagCache[cacheKey]) return flagCache[cacheKey];

  // Check for well-known historical flags (placeholders or static URLs)
  const knownFlags: Record<string, string> = {
    'United Kingdom': 'https://upload.wikimedia.org/wikipedia/en/a/ae/Flag_of_the_United_Kingdom.svg',
    'Great Britain': 'https://upload.wikimedia.org/wikipedia/en/a/ae/Flag_of_the_United_Kingdom.svg',
    'UK': 'https://upload.wikimedia.org/wikipedia/en/a/ae/Flag_of_the_United_Kingdom.svg',
    'USA': 'https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg',
    'United States': 'https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg',
    'America': 'https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg',
    'Soviet Union': 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Flag_of_the_Soviet_Union.svg',
    'USSR': 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Flag_of_the_Soviet_Union.svg',
    'Russia': 'https://upload.wikimedia.org/wikipedia/en/f/f3/Flag_of_Russia.svg',
    'Germany': 'https://upload.wikimedia.org/wikipedia/en/b/ba/Flag_of_Germany.svg',
    'Nazi Germany': 'https://upload.wikimedia.org/wikipedia/commons/7/77/Flag_of_Germany_%281935%E2%80%931945%29.svg',
    'Third Reich': 'https://upload.wikimedia.org/wikipedia/commons/7/77/Flag_of_Germany_%281935%E2%80%931945%29.svg',
    'Japan': 'https://upload.wikimedia.org/wikipedia/en/9/9e/Flag_of_Japan.svg',
    'Empire of Japan': 'https://upload.wikimedia.org/wikipedia/commons/5/54/Flag_of_the_Imperial_Japanese_Army.svg',
    'France': 'https://upload.wikimedia.org/wikipedia/en/c/c3/Flag_of_France.svg',
    'Poland': 'https://upload.wikimedia.org/wikipedia/en/1/12/Flag_of_Poland.svg',
    'Italy': 'https://upload.wikimedia.org/wikipedia/en/0/03/Flag_of_Italy.svg',
    'China': 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Flag_of_the_People%27s_Republic_of_China.svg',
    'Spain': 'https://upload.wikimedia.org/wikipedia/en/9/9a/Flag_of_Spain.svg',
    'Canada': 'https://upload.wikimedia.org/wikipedia/en/c/cf/Flag_of_Canada.svg',
    'Australia': 'https://upload.wikimedia.org/wikipedia/en/b/b9/Flag_of_Australia.svg',
    'India': 'https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg',
    'Brazil': 'https://upload.wikimedia.org/wikipedia/en/0/05/Flag_of_Brazil.svg',
    'Turkey': 'https://upload.wikimedia.org/wikipedia/commons/b/b4/Flag_of_Turkey.svg',
    'Ottoman Empire': 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Flag_of_the_Ottoman_Empire.svg',
    'Austria-Hungary': 'https://upload.wikimedia.org/wikipedia/commons/2/29/Flag_of_Austria-Hungary_%281869-1918%29.svg',
    'Prussia': 'https://upload.wikimedia.org/wikipedia/commons/5/5b/Flag_of_Prussia_%281892-1918%29.svg',
  };

  if (knownFlags[faction]) {
    return knownFlags[faction];
  }

  // Fallback to a generic tactical icon for fictional or unknown factions
  // Using a consistent seed based on faction name for stable placeholders
  const seed = faction.replace(/\s+/g, '-').toLowerCase();
  return `https://picsum.photos/seed/${seed}/300/200`;
};
