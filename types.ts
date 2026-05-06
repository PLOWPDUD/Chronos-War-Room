
export interface ScenarioInput {
  name: string;
  description: string;
  continent: string;
  additionalContext: string;
  eventCount: number;
  startYear: string;
  endYear: string;
  existingEvents?: WarEvent[]; // For continuation
  customFlags?: CustomFlag[];
  directive?: string;
}

export interface CustomFlag {
  factionName: string;
  url?: string;
  existenceDate?: string;
}

export interface WarEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  strategicImpact: number; // 1-10
  factionsInvolved: string[];
  location: string;
  latitude: number;
  longitude: number;
}

export interface GenerationResult {
  scenarioName: string;
  overview: string;
  events: WarEvent[];
  factionFlags?: Record<string, string>; // Map faction name to flag image URL
  factionIntel?: Record<string, { flagUrl?: string; existenceDate?: string }>;
}

export interface SavedScenario extends GenerationResult {
  id: string;
  timestamp: number;
  input: ScenarioInput;
}

export type AppState = 'IDLE' | 'GENERATING' | 'RESULT';
