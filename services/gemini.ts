
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
  },
  {
    type: "NAVAL",
    titles: ["Naval Blockade", "The Iron Fleet", "Submarine Strike", "Carrier Group Deployment", "The Great Armada"],
    desc: (f1: string, f2: string, loc: string) => `A massive naval engagement occurred off the coast of ${loc}. ${f1} carrier groups launched a coordinated strike against ${f2} supply lines, effectively cutting off the region from reinforcements.`
  },
  {
    type: "AERIAL",
    titles: ["The Great Dogfight", "Sky Fortress", "Strategic Bombing", "Airborne Invasion", "Cloud Front"],
    desc: (f1: string, f2: string, loc: string) => `The skies above ${loc} were filled with the roar of engines as ${f1} launched a massive aerial offensive. ${f2} anti-air batteries struggled to keep up with the sheer volume of incoming bombers.`
  },
  {
    type: "CYBER",
    titles: ["The Digital Collapse", "Zero Day Strike", "Neural Network Breach", "Data Purge", "The Silicon War"],
    desc: (f1: string, f2: string, loc: string) => `A devastating cyber-attack crippled the infrastructure in ${loc}. ${f1} hackers bypassed ${f2} firewalls, causing a total blackout and disabling critical defense systems.`
  },
  {
    type: "RECON",
    titles: ["The Long Range Patrol", "Scout Mission", "The Forward Base", "Border Skirmish", "The Hidden Outpost"],
    desc: (f1: string, f2: string, loc: string) => `Small units from ${f1} were spotted near ${loc} conducting high-altitude reconnaissance. ${f2} patrols engaged the scouts, leading to a series of intense skirmishes across the border.`
  },
  {
    type: "LOGISTICS",
    titles: ["Supply Chain Sabotage", "The Great Convoy", "Fuel Depletion", "The Resource War", "Bridgehead Established"],
    desc: (f1: string, f2: string, loc: string) => `Strategic supply lines through ${loc} were targeted by ${f1} forces. ${f2} logistics units were forced to retreat, leaving the front line vulnerable and undersupplied.`
  }
];

const generateMockScenario = (input: ScenarioInput): GenerationResult => {
  console.log("Generating Enhanced Simulation Scenario...");
  
  const startYearNum = parseInt(input.startYear.replace(/\D/g, '')) || 2030;
  const endYearNum = parseInt(input.endYear.replace(/\D/g, '')) || 2040;
  const yearRange = Math.max(1, endYearNum - startYearNum);
  
  // 1. Setup Context
  const geo = CONTINENT_CONFIG[input.continent] || CONTINENT_CONFIG['Global'];
  let factions = FACTION_POOLS[Math.floor(Math.random() * FACTION_POOLS.length)];
  const factionFlags: Record<string, string> = {};
  const factionIntel: Record<string, { flagUrl?: string; existenceDate?: string }> = {};

  if (input.customFlags && input.customFlags.length > 0) {
    const customFactions = input.customFlags.map(f => f.factionName);
    // Mix custom and default factions
    factions = [...customFactions, ...factions].slice(0, 3);
    input.customFlags.forEach(cf => {
      if (cf.url) factionFlags[cf.factionName] = cf.url;
      factionIntel[cf.factionName] = { flagUrl: cf.url, existenceDate: cf.existenceDate };
    });
  }

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
    
    // Determine actors for this event, respecting existence dates if possible
    let actorA = protagonist;
    let actorB = antagonist;

    const checkExistence = (faction: string, year: number) => {
      const intel = factionIntel[faction];
      if (!intel || !intel.existenceDate) return true;
      const existenceYear = parseInt(intel.existenceDate.replace(/\D/g, '')) || 0;
      return year >= existenceYear;
    };

    if (!checkExistence(actorA, currentYear)) actorA = wildcard;
    if (!checkExistence(actorA, currentYear)) actorA = "Unknown Resistance";
    if (!checkExistence(actorB, currentYear)) actorB = "Local Militia";

    // 4. Coordinates with jitter
    const latBase = geo.latRange[0] + Math.random() * (geo.latRange[1] - geo.latRange[0]);
    const lngBase = geo.lngRange[0] + Math.random() * (geo.lngRange[1] - geo.lngRange[0]);
    
    // 5. Narrative Construction
    const prefix = template.titles[Math.floor(Math.random() * template.titles.length)];
    let title = `${prefix} ${city}`;
    if (template.type === "COVERT" || template.type === "TECH" || template.type === "CYBER") {
      title = `${prefix}: ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}-${Math.floor(Math.random() * 99)}`;
    }
    
    // Ensure unique titles if possible
    let attempts = 0;
    while (usedTitles.has(title) && attempts < 5) {
       title = `${prefix} ${city} (II)`;
       attempts++;
    }
    usedTitles.add(title);

    // Calculate impact (Simulate rising tension curve: start low, peak middle/end)
    let baseImpact = Math.floor(Math.random() * 5) + 3; // 3-8
    if (template.type === "BATTLE" || template.type === "TECH" || template.type === "NAVAL") baseImpact += 2;
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

  return {
    scenarioName: input.name,
    overview: `[SIMULATION MODE ACTIVE] \n\nScenario: ${input.name}\nTheater: ${input.continent}\n\nAnalysis: In a divergent timeline starting ${input.startYear}, the conflict between ${protagonist} and ${antagonist} escalated rapidly. Based on your input "${input.description.substring(0, 30)}...", the simulation projects a series of escalating engagements culminating in a global strategic shift.${input.directive ? `\n\nExpansion Directive: ${input.directive}` : ""}`,
    events: events,
    factionFlags: factionFlags,
    factionIntel: factionIntel
  };
};

export const generateWarScenario = async (input: ScenarioInput): Promise<GenerationResult> => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    return generateMockScenario(input);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const isContinuation = input.existingEvents && input.existingEvents.length > 0;
    
    let prompt = "";
    if (isContinuation && input.existingEvents) {
      prompt = `Continue the alternate history/war scenario titled "${input.name}".
      Already occurred events: ${JSON.stringify(input.existingEvents.map(e => ({ date: e.date, title: e.title })))}
      Premise: ${input.description}
      Additional Context: ${input.additionalContext}
      ${input.directive ? `STRATEGIC DIRECTIVE: ${input.directive}` : ''}
      Generate ${input.eventCount} NEW chronological events that happen AFTER the last known event. 
      ${input.directive ? `Ensure these new events strictly follow the Strategic Directive provided.` : ''}
      `;
    } else {
      prompt = `Generate a detailed alternate history/war scenario titled "${input.name}".
      Continent: ${input.continent}
      Historical Timeframe: From ${input.startYear} to ${input.endYear}.
      Premise: ${input.description}
      Additional Context: ${input.additionalContext}
      Required Events: Exactly ${input.eventCount} chronological events.
      `;
    }

    prompt += `
    For each event, provide:
    1. A specific date.
    2. A title.
    3. A detailed military/geopolitical description.
    4. A strategic impact score (1-10).
    5. Key factions (ensure they are consistent if this is a continuation).
    6. Specific location name.
    7. Approximate geographic coordinates (latitude and longitude).
    `;

    if (input.customFlags && input.customFlags.length > 0) {
      const customFactions = input.customFlags.map(f => {
        let details = `"${f.factionName}"`;
        if (f.existenceDate) details += ` (active since ${f.existenceDate})`;
        return details;
      });
      
      prompt += `
      CRITICAL: The user has specified custom factions involved: ${customFactions.join(', ')}. 
      You MUST use these exact faction names in the scenario. 
      CHRONOLOGY RULE: A faction MUST NOT appear in the timeline before its specified 'existence date'. Introduce these factions into the narrative naturally as they emerge in history. Do not make a faction a primary actor if it hasn't existed yet in the timeline.
      For these factions, do NOT map them to ISO codes in the "factionFlags" output if they are fictional or non-standard, as the system already has their data.
      `;
    }
    
    prompt += `
    SPECIAL TASK: For every faction involved in this scenario, map their name to a standard ISO 3166-1 alpha-2 country code if they represent a real country (e.g., "United Kingdom" -> "gb", "Germany" -> "de"). Include these in a "factionFlags" map.
    
    IMPORTANT: Return the response strictly as JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scenarioName: { type: Type.STRING },
            overview: { type: Type.STRING },
            factionFlags: { 
              type: Type.OBJECT,
              description: "Map of faction names to their ISO country codes (e.g., 'gb', 'us', 'fr')"
            },
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
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from AI");
    }
    
    const resultStr = text.trim();
    const data = JSON.parse(resultStr) as GenerationResult;
    
    // Initialize factionIntel from factionFlags if it exists
    if (data.factionFlags && !data.factionIntel) {
      data.factionIntel = {};
      Object.entries(data.factionFlags).forEach(([name, url]) => {
        data.factionIntel![name] = { flagUrl: url };
      });
    }

    data.events = data.events.map((e, idx) => ({
      ...e,
      id: e.id || `event-${idx}-${Date.now()}`
    }));

    if (isContinuation && input.existingEvents) {
      // Merge with existing events
      data.events = [...input.existingEvents, ...data.events];
    }

    // Merge custom flags provided by user into the results
    if (input.customFlags) {
      const mergedFlags = { ...data.factionFlags };
      const mergedIntel = { ...data.factionIntel };
      input.customFlags.forEach(cf => {
        if (cf.url) {
          mergedFlags[cf.factionName] = cf.url;
        }
        mergedIntel[cf.factionName] = { 
          flagUrl: cf.url || mergedIntel[cf.factionName]?.flagUrl, 
          existenceDate: cf.existenceDate || mergedIntel[cf.factionName]?.existenceDate 
        };
      });
      data.factionFlags = mergedFlags;
      data.factionIntel = mergedIntel;
    }

    return data;
  } catch (e) {
    console.warn("AI Generation failed, falling back to simulation mode:", e);
    return generateMockScenario(input);
  }
};
