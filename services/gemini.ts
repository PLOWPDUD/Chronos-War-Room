
import { GoogleGenAI, Type } from "@google/genai";
import { ScenarioInput, GenerationResult, WarEvent } from "../types";

// --- SIMULATION MODE (OFFLINE GENERATOR) ---
const generateMockScenario = (input: ScenarioInput): GenerationResult => {
  console.log("Switching to Simulation Mode (No API Key detected or API Error)");
  
  const startYearNum = parseInt(input.startYear.replace(/\D/g, '')) || 2030;
  const endYearNum = parseInt(input.endYear.replace(/\D/g, '')) || 2040;
  const yearRange = Math.max(1, endYearNum - startYearNum);
  
  const prefixes = ["Operation", "The Siege of", "Treaty of", "Battle for", "The Fall of", "Uprising in", "Strike on"];
  const locations = [
    { name: "Iron Gate", lat: 44.6, lng: 22.5 },
    { name: "Crimson Valley", lat: 34.0, lng: 66.0 },
    { name: "Sector 7", lat: 51.5, lng: -0.1 },
    { name: "New Vegas Zone", lat: 36.1, lng: -115.1 },
    { name: "Arctic Outpost", lat: 78.2, lng: 15.6 },
    { name: "Pacific Rim Command", lat: 35.6, lng: 139.6 },
    { name: "The Citadel", lat: 30.0, lng: 31.2 },
    { name: "Northern Front", lat: 60.1, lng: 24.9 }
  ];
  
  const factions = [
    "The Coalition", "Imperial Guard", "Rebel Alliance", "Cyber-State Union", 
    "Wasteland Raiders", "Techno-Theocracy", "United Nations Remnant"
  ];

  const events: WarEvent[] = Array.from({ length: input.eventCount }).map((_, i) => {
    // Distribute dates evenly across the range
    const currentYear = startYearNum + Math.floor((i / (input.eventCount - 1)) * yearRange);
    const month = ["Jan", "Mar", "Jun", "Sep", "Nov"][Math.floor(Math.random() * 5)];
    const loc = locations[i % locations.length];
    
    // Add some randomness to coordinates so they don't stack perfectly
    const latOffset = (Math.random() - 0.5) * 10;
    const lngOffset = (Math.random() - 0.5) * 10;

    const factionA = factions[Math.floor(Math.random() * factions.length)];
    const factionB = factions[Math.floor(Math.random() * factions.length)];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];

    return {
      id: `sim-event-${i}-${Date.now()}`,
      date: `${month} ${currentYear}`,
      title: `${prefix} ${loc.name}`,
      description: `SIMULATED INTELLIGENCE: In the ${input.continent} theater, tensions escalated as ${factionA} engaged ${factionB}. This event marked a critical juncture in the "${input.name}" timeline, aligning with the premise: ${input.description.substring(0, 50)}...`,
      strategicImpact: Math.floor(Math.random() * 10) + 1,
      factionsInvolved: [factionA, factionB],
      location: loc.name,
      latitude: loc.lat + latOffset,
      longitude: loc.lng + lngOffset
    };
  });

  return {
    scenarioName: input.name,
    overview: `[OFFLINE SIMULATION] generated for "${input.name}". \n\nSystem Note: Detailed AI analysis is unavailable (No API Key). Displaying tactical projections based on provided parameters: "${input.description}"`,
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
