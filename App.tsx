
import React, { useState, useCallback, useEffect } from 'react';
import { ScenarioInput, GenerationResult, AppState, SavedScenario } from './types';
import { generateWarScenario } from './services/gemini';
import InputPanel from './components/InputPanel';
import TimelineView from './components/TimelineView';
import Header from './components/Header';
import LoadingScreen from './components/LoadingScreen';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>('IDLE');
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([]);

  // Load saved scenarios on mount
  useEffect(() => {
    const saved = localStorage.getItem('CHRONOS_SAVED_SCENARIOS');
    if (saved) {
      try {
        setSavedScenarios(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load saved scenarios", e);
      }
    }
  }, []);

  const handleGenerate = useCallback(async (input: ScenarioInput) => {
    setState('GENERATING');
    setError(null);
    try {
      const data = await generateWarScenario(input);
      setResult(data);
      setState('RESULT');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate intelligence. The server might be jammed. Please try again.');
      setState('IDLE');
    }
  }, []);

  const handleSave = useCallback((scenario: GenerationResult) => {
    const newSaved: SavedScenario = {
      ...scenario,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      input: {
        name: scenario.scenarioName,
        description: scenario.overview,
        continent: 'Global', // Default fallback as original input is not persisted in result
        additionalContext: '',
        eventCount: scenario.events.length,
        startYear: scenario.events[0]?.date || '',
        endYear: scenario.events[scenario.events.length - 1]?.date || ''
      }
    };
    
    const updated = [newSaved, ...savedScenarios];
    setSavedScenarios(updated);
    localStorage.setItem('CHRONOS_SAVED_SCENARIOS', JSON.stringify(updated));
  }, [savedScenarios]);

  const handleDeleteSaved = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedScenarios.filter(s => s.id !== id);
    setSavedScenarios(updated);
    localStorage.setItem('CHRONOS_SAVED_SCENARIOS', JSON.stringify(updated));
  }, [savedScenarios]);

  const handleLoadSaved = useCallback((scenario: SavedScenario) => {
    setResult(scenario);
    setState('RESULT');
  }, []);

  const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);

        // Basic validation
        if (!parsed.scenarioName || !parsed.events || !Array.isArray(parsed.events)) {
          alert("Invalid scenario file: Missing core intelligence data.");
          return;
        }

        const newScenario: SavedScenario = {
          scenarioName: parsed.scenarioName,
          overview: parsed.overview,
          events: parsed.events,
          id: parsed.id || crypto.randomUUID(),
          timestamp: parsed.timestamp || Date.now(),
          input: parsed.input || {
            name: parsed.scenarioName,
            description: parsed.overview,
            continent: 'Unknown',
            additionalContext: 'Imported Intelligence',
            eventCount: parsed.events.length,
            startYear: parsed.events[0]?.date || 'Unknown',
            endYear: parsed.events[parsed.events.length - 1]?.date || 'Unknown'
          }
        };

        setSavedScenarios(prev => {
          const updated = [newScenario, ...prev];
          localStorage.setItem('CHRONOS_SAVED_SCENARIOS', JSON.stringify(updated));
          return updated;
        });

        // Reset input value to allow selecting the same file again
        event.target.value = '';
      } catch (err) {
        console.error("Import failed", err);
        alert("Failed to parse intelligence file.");
      }
    };
    reader.readAsText(file);
  }, []);

  const handleReset = useCallback(() => {
    setState('IDLE');
    setResult(null);
    setError(null);
  }, []);

  return (
    <div className="min-h-screen flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8 relative">
      <Header />
      
      {state === 'IDLE' && (
        <div className="flex flex-col lg:flex-row items-start justify-center flex-1 gap-12">
          <div className="w-full lg:w-2/3">
            <InputPanel onGenerate={handleGenerate} isSubmitting={false} />
            {error && (
              <div className="mt-6 p-4 bg-red-900/30 border border-red-500 rounded-lg text-red-200 mono text-sm flex items-center gap-3">
                <span className="animate-pulse">⚠️</span>
                {error}
              </div>
            )}
          </div>

          {/* Saved Scenarios Sidebar */}
          <div className="w-full lg:w-1/3 flex flex-col gap-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-slate-400 mono text-xs uppercase tracking-widest font-bold">Strategic Archive</h3>
              
              <div className="flex items-center gap-4">
                <label className="cursor-pointer flex items-center gap-1.5 text-emerald-500 hover:text-emerald-400 transition-colors group">
                  <input type="file" accept=".json" className="hidden" onChange={handleImport} />
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span className="mono text-[10px] font-bold uppercase group-hover:underline decoration-emerald-500/50 underline-offset-2">Import Intel</span>
                </label>
                <span className="text-slate-600 mono text-[10px] border-l border-slate-800 pl-4">{savedScenarios.length} SAVED</span>
              </div>
            </div>

            {savedScenarios.length > 0 ? (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800">
                {savedScenarios.map((s) => (
                  <div 
                    key={s.id}
                    onClick={() => handleLoadSaved(s)}
                    className="group relative bg-slate-900/40 border border-slate-800 p-4 rounded-lg cursor-pointer hover:border-emerald-500/50 transition-all hover:bg-slate-800/40"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-white font-bold text-sm group-hover:text-emerald-400 transition-colors">{s.scenarioName}</h4>
                      <button 
                        onClick={(e) => handleDeleteSaved(s.id, e)}
                        className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete Operation"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-slate-500 text-xs line-clamp-2 mb-2">{s.overview}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] mono text-slate-600 uppercase">
                        {new Date(s.timestamp).toLocaleDateString()}
                      </span>
                      <span className="text-[9px] mono text-emerald-500/60 uppercase">
                        {s.events.length} PHASES
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-900/20 border border-dashed border-slate-800 p-8 rounded-lg text-center">
                <p className="text-slate-600 text-xs mono">ARCHIVE EMPTY</p>
                <p className="text-slate-700 text-[10px] mt-1">Generated simulations will appear here after saving.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {state === 'GENERATING' && (
        <LoadingScreen />
      )}

      {state === 'RESULT' && result && (
        <TimelineView 
          result={result} 
          onBack={handleReset} 
          onSave={handleSave}
        />
      )}

      {/* Footer Branding */}
      <footer className="text-slate-500 mono text-xs text-center py-4 border-t border-slate-800/50 mt-auto">
        &copy; 2024 STRATOS-INTEL // CLASSIFIED // LEVEL 4 CLEARANCE REQUIRED
      </footer>
    </div>
  );
};

export default App;
