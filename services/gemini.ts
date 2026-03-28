
import { GoogleGenAI, Type } from "@google/genai";
import { ScenarioInput, GenerationResult } from "../types";

export const generateWarScenario = async (input: ScenarioInput): Promise<GenerationResult> => {
  // In AI Studio, GEMINI_API_KEY is the standard environment variable.
  // We also check for API_KEY as a fallback for other environments.
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    throw new Error("Gemini API key is missing. Please ensure GEMINI_API_KEY is set in your environment.");
  }

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
    model: 'gemini-3-flash-preview',
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
      }
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
};
