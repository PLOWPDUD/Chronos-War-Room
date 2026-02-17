
import { GoogleGenAI, Type } from "@google/genai";
import { ScenarioInput, GenerationResult, WarEvent } from "../types";

// --- SIMULATION DATA & LOGIC ---

const CONTINENT_CONFIG: Record<string, { latRange: [number, number], lngRange: [number, number], cities: string[] }> = {
  'North America': { 
    latRange: [25, 60], lngRange: [-130, -70], 
    cities: ["Chicago Zone", "New DC", "Cascadia Front", "Texas Freehold", "Quebec Citadel", "Mojave Outpost", "Denver Core", "Anchorage Wall"] 
  },
  'South America': { 
    latRange: [-50, 10], lngRange: [-80, -35], 
    cities: ["Amazonia Fortress", "Andean Spire", "Rio Sector", "Patagonia Base", "Caracas DMZ", "Lima Stronghold", "Bogota Grid"] 
  },
  'Europe': { 
    latRange: [36, 70], lngRange: [-10, 40], 
    cities: ["Neo-Berlin", "Paris Commune", "Balkan Front", "Nordic Wall", "Mediterranean Fleet", "London Undercity", "Kyiv Shield", "Rome Enclave"] 
  },
  'Asia': { 
    latRange: [10, 55], lngRange: [60, 145], 
    cities: ["Shanghai Zone", "Siberian Grid", "Tokyo Bay", "Mumbai Hive", "Seoul DMZ", "Mekong Delta", "Gobi Station", "Manila Port"] 
  },
  'Africa': { 
    latRange: [-35, 35], lngRange: [-15, 50], 
    cities: ["Cairo Citadel", "Lagos Hub", "Cape Fortress", "Sahara Outpost", "Rift Valley Command", "Nairobi Link", "Atlas Mountain Base"] 
  },
  'Oceania': { 
    latRange: [-45, -10], lngRange: [110, 180], 
    cities: ["Tasman Base", "Coral Sea Fleet", "Outback Station", "Java Trench", "Southern Cross", "Auckland Port", "Perth Nexus"] 
  },
  'Antarctica': { 
    latRange: [-90, -60], lngRange: [-180, 180], 
    cities: ["McMurdo Dome", "Vostok Core", "Ice Shelf Alpha", "Polar Station", "Shackleton Crater"] 
  },
  'Global': { 
    latRange: [-50, 70], lngRange: [-180, 180], 
    cities: ["Geneva Core", "Lunar Launchpad", "Orbital Anchor", "Atlantic Ridge", "Pacific Command", "Global HQ", "Arctic Vault"] 
  }
};

const FACTION_POOLS = [
  ["The Coalition", "Imperial Guard", "Red Cell"],
  ["United Nations Remnant", "Separatist Front", "Black Sun Mercenaries"],
  ["Techno-Theocracy", "Neo-Luddite Resistance", "AI Overlords"],
  ["Atlantic Alliance", "Eurasian Pact", "Pacific Rim Defense"],
  ["Corporate Syndicate", "Workers' Union", "The Faceless"]
];

const EVENT_TEMPLATES = [
  {
    type: "BATTLE",
    titles: ["Battle of", "Siege of", "The Fall of", "Assault on", "Clash at"],
    desc: (f1: string, f2: string, loc: string) => `Heavy combat erupted in ${loc} as ${f1} armored divisions breached the outer perimeter. ${f2} defenders responded with orbital strikes, turning the city into a war zone.`
  },
  {
    type: "COVERT",
    titles: ["Operation Silent Night", "The Shadow War", "Intelligence Leak", "Midnight Raid", "Protocol 7"],
    desc: (f1: string, f2: string, loc: string) => `Detailed intelligence reports indicate ${f1} special forces executed a covert raid on a ${f2} research facility in ${loc}. Vital blueprints were stolen before the facility self-destructed.`
  },
  {
    type: "DIPLOMATIC",
    titles: ["The Summit", "Broken Treaty", "Ceasefire Violation", "Trade Embargo", "Alliance Formed"],
    desc: (f1: string, f2: string, loc: string) => `Diplomatic channels collapsed near ${loc} after ${f2} executed prisoners of war. ${f1} has formally declared total war, mobilizing reserve fleets.`
  },
  {
    type: "TECH",
    titles: ["Project Awakening", "The New Weapon", "Cyber Attack", "Grid Failure", "Biological Incident"],
    desc: (f1: string, f2: string, loc: string) => `A massive technological anomaly was detected in ${loc}. Sources suggest ${f2} deployed an experimental weapon, disabling ${f1} electronics across the entire sector.`
  },
  {
    type: "UPRISING",
    titles: ["Civil Unrest", "The Riots", "Food Shortages", "Martial Law", "The Rebellion"],
    desc: (f1: string, f2: string, loc: string) => `Civilian unrest in ${loc} reached a breaking point due to resource scarcity. ${f1} forces attempted to quell the riots, but were ambushed by ${f2} sympathizers.`
  }
];

const generateMockScenario = (input: ScenarioInput): GenerationResult => {
  console.log("Generating Enhanced Simulation Scenario...");
  
  const startYearNum = parseInt(input.startYear.replace(/\D/g, '')) || 2030;
  const endYearNum = parseInt(input.endYear.replace(/\D/g, '')) || 2040;
  const yearRange = Math.max(1, endYearNum - startYearNum);
  
  // 1. Setup Context
  const geo = CONTINENT_CONFIG[input.continent] || CONTINENT_CONFIG['Global'];
  const factions = FACTION_POOLS[Math.floor(Math.random() * FACTION_POOLS.length)];
  const protagonist = factions[0];
  const antagonist = factions[1];
  const wildcard = factions[2];

  const events: WarEvent[] = [];
  const usedTitles = new Set<string>();

  for (let i = 0; i < input.eventCount; i++) {
    // 2. Progression Logic
    const progress = i / (input.eventCount - 1); // 0 to 1
    const currentYear = startYearNum + Math.floor(progress * yearRange);
    const month = ["Jan", "Feb", "Apr", "Jun", "Aug", "Oct", "Dec"][Math.floor(Math.random() * 7)];
    
    // 3. Selection
    const template = EVENT_TEMPLATES[Math.floor(Math.random() * EVENT_TEMPLATES.length)];
    const city = geo.cities[Math.floor(Math.random() * geo.cities.length)];
    
    // 4. Coordinates with jitter
    const latBase = geo.latRange[0] + Math.random() * (geo.latRange[1] - geo.latRange[0]);
    const lngBase = geo.lngRange[0] + Math.random() * (geo.lngRange[1] - geo.lngRange[0]);
    
    // 5. Narrative Construction
    const prefix = template.titles[Math.floor(Math.random() * template.titles.length)];
    let title = `${prefix} ${city}`;
    if (template.type === "COVERT" || template.type === "TECH") {
      title = `${prefix}: ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}-${Math.floor(Math.random() * 99)}`;
    }
    
    // Ensure unique titles if possible
    let attempts = 0;
    while (usedTitles.has(title) && attempts < 5) {
       title = `${prefix} ${city} (II)`;
       attempts++;
    }
    usedTitles.add(title);

    // Determine actors for this event
    const actorA = Math.random() > 0.3 ? protagonist : wildcard;
    const actorB = antagonist;
    
    // Calculate impact (Simulate rising tension curve: start low, peak middle/end)
    let baseImpact = Math.floor(Math.random() * 5) + 3; // 3-8
    if (template.type === "BATTLE" || template.type === "TECH") baseImpact += 2;
    if (progress > 0.8) baseImpact += 1; // Climax
    const impact = Math.min(10, Math.max(1, baseImpact));

    events.push({
      id: `sim-${Date.now()}-${i}`,
      date: `${month} ${currentYear}`,
      title: title,
      description: template.desc(actorA, actorB, city),
      strategicImpact: impact,
      factionsInvolved: [actorA, actorB],
      location: city,
      latitude: latBase,
      longitude: lngBase
    });
  }

  // Sort chronologically just in case (though generation is linear)
  // events.sort ... (already generated linearly)

  return {
    scenarioName: input.name,
    overview: `[SIMULATION MODE ACTIVE] \n\nScenario: ${input.name}\nTheater: ${input.continent}\n\nAnalysis: In a divergent timeline starting ${input.startYear}, the conflict between ${protagonist} and ${antagonist} escalated rapidly. Based on your input "${input.description.substring(0, 30)}...", the simulation projects a series of escalating engagements culminating in a global strategic shift.`,
    events: events
  };
};

// --- MAIN GENERATOR ---
export const generateWarScenario = async (input: ScenarioInput): Promise<GenerationResult> => {
  const apiKey = process.env.API_KEY;

  // 1. Immediate Fallback: If no key, use simulation mode directly without error.
  if (!apiKey || apiKey.trim() === '') {
    return generateMockScenario(input);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Generate a detailed alternate history/war scenario titled "${input.name}".
    Continent: ${input.continent}
    Historical Timeframe: From ${input.startYear} to ${input.endYear}.
    Premise: ${input.description}
    Additional Context: ${input.additionalContext}
    Required Events: Exactly ${input.eventCount} chronological events.
    
    For each event, provide:
    1. A specific date.
    2. A title.
    3. A detailed military/geopolitical description.
    4. A strategic impact score (1-10).
    5. Key factions.
    6. Specific location name.
    7. Approximate geographic coordinates (latitude and longitude) for the location.
    
    IMPORTANT: Return the response strictly as JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scenarioName: { type: Type.STRING },
            overview: { type: Type.STRING },
            events: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  date: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  strategicImpact: { type: Type.NUMBER },
                  factionsInvolved: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  location: { type: Type.STRING },
                  latitude: { type: Type.NUMBER },
                  longitude: { type: Type.NUMBER }
                },
                required: ['id', 'date', 'title', 'description', 'strategicImpact', 'factionsInvolved', 'location', 'latitude', 'longitude']
              }
            }
          },
          required: ['scenarioName', 'overview', 'events']
        },
        thinkingConfig: { thinkingBudget: 4000 }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from AI");
    }
    
    const resultStr = text.trim();
    const data = JSON.parse(resultStr) as GenerationResult;
    
    data.events = data.events.map((e, idx) => ({
      ...e,
      id: e.id || `event-${idx}`
    }));
    return data;

  } catch (e) {
    console.warn("AI Generation failed, falling back to simulation mode:", e);
    // 2. Error Fallback: If the API call fails (e.g., quota exceeded, invalid key), use simulation mode.
    return generateMockScenario(input);
  }
};
