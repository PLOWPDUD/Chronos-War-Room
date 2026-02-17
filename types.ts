
export interface ScenarioInput {
  name: string;
  description: string;
  continent: string;
  additionalContext: string;
  eventCount: number;
  startYear: string;
  endYear: string;
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
}

export interface SavedScenario extends GenerationResult {
  id: string;
  timestamp: number;
  input: ScenarioInput;
}

export type AppState = 'IDLE' | 'GENERATING' | 'RESULT';
