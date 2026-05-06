
import React, { useState, useRef } from 'react';
import { ScenarioInput, CustomFlag } from '../types';

interface Props {
  onGenerate: (input: ScenarioInput) => void;
  isSubmitting: boolean;
}

const InputPanel: React.FC<Props> = ({ onGenerate, isSubmitting }) => {
  const [formData, setFormData] = useState<ScenarioInput>({
    name: '',
    description: '',
    continent: 'Global',
    additionalContext: '',
    eventCount: 10,
    startYear: '1939 AD',
    endYear: '1945 AD'
  });

  const [customFlags, setCustomFlags] = useState<CustomFlag[]>([]);
  const [newFlagName, setNewFlagName] = useState('');
  const [newFlagDate, setNewFlagDate] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.description || isSubmitting) return;
    onGenerate({ ...formData, customFlags });
  };

  const handleAddFaction = () => {
    if (!newFlagName.trim()) return;
    setCustomFlags(prev => [...prev, { 
      factionName: newFlagName.trim(), 
      existenceDate: newFlagDate.trim() || undefined 
    }]);
    setNewFlagName('');
    setNewFlagDate('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!newFlagName.trim()) {
      alert("Please provide a faction name for this flag first.");
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setCustomFlags(prev => [...prev, { 
        factionName: newFlagName.trim(), 
        url: base64String,
        existenceDate: newFlagDate.trim() || undefined
      }]);
      setNewFlagName('');
      setNewFlagDate('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  const removeFlag = (index: number) => {
    setCustomFlags(prev => prev.filter((_, i) => i !== index));
  };

  const continents = ['North America', 'South America', 'Europe', 'Asia', 'Africa', 'Oceania', 'Antarctica', 'Global'];

  const presets = [
    {
      name: "Invasion of Poland",
      description: "Germany invades Poland on September 1, 1939, but Poland manages to hold the Vistula line for six months, drawing the Soviet Union into a premature conflict with Germany.",
      startYear: "1939 AD",
      endYear: "1940 AD",
      continent: "Europe",
      eventCount: 25
    },
    {
      name: "Operation Sea Lion",
      description: "The Luftwaffe achieves air superiority over the English Channel in 1940, leading to a successful German amphibious invasion of Southern England.",
      startYear: "1940 AD",
      endYear: "1942 AD",
      continent: "Europe",
      eventCount: 30
    },
    {
      name: "The Red Sun Rising",
      description: "The Soviet Union successfully lands troops in Hokkaido in 1945, leading to a partitioned Japan similar to East and West Germany.",
      startYear: "1945 AD",
      endYear: "1955 AD",
      continent: "Asia",
      eventCount: 20
    },
    {
      name: "Algerian Independence (1889)",
      description: "French colonialism fails in Algeria in 1889, leading to an independent republic. The nation joins the Allies in both World Wars but maintains strict neutrality throughout the Cold War.",
      startYear: "1889 AD",
      endYear: "1991 AD",
      continent: "Africa",
      eventCount: 100
    },
    {
      name: "Aztec Repel Spain",
      description: "The Aztec Empire successfully repels Hernán Cortés in 1521, adopting European technology and establishing a dominant Mesoamerican superpower that rivals European colonial ambitions.",
      startYear: "1521 AD",
      endYear: "1800 AD",
      continent: "North America",
      eventCount: 75
    }
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    setFormData({
      ...formData,
      ...preset,
      additionalContext: preset.description // Also put it in context for better AI results
    });
  };

  return (
    <div className="w-full max-w-2xl bg-slate-900/40 border border-slate-800 p-6 sm:p-8 rounded-xl backdrop-blur-sm shadow-2xl relative overflow-hidden group">
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>

      <div className="mb-8 space-y-3">
        <label className="text-slate-500 mono text-[10px] uppercase tracking-widest font-bold block">Scenario Presets</label>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => applyPreset(preset)}
              className="px-3 py-1.5 rounded-full bg-slate-950 border border-slate-800 text-slate-400 text-xs hover:border-emerald-500/50 hover:text-emerald-400 transition-all active:scale-95"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1">
          <label className="text-emerald-400 mono text-xs uppercase tracking-widest font-bold">Scenario Name</label>
          <input
            type="text"
            required
            placeholder="e.g. The Man in the High Castle"
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-700 text-lg font-bold"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="space-y-1">
          <label className="text-emerald-400 mono text-xs uppercase tracking-widest font-bold">What Happened? (The Divergence)</label>
          <textarea
            required
            placeholder="Describe the alternate historical event..."
            rows={4}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-700 resize-none text-base"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-800/50">
          <div className="flex justify-between items-center">
            <label className="text-emerald-400 mono text-xs uppercase tracking-widest font-bold">Factions of Interest</label>
            <span className="text-slate-500 mono text-[9px] uppercase">Optional: Add specific nations or upload custom flags</span>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <input 
              type="text"
              placeholder="Faction Name (e.g. Neo-Sparta)"
              className="flex-1 bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white focus:border-emerald-500"
              value={newFlagName}
              onChange={(e) => setNewFlagName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFaction())}
            />
            <input 
              type="text"
              placeholder="Existence Date (e.g. 1920 AD)"
              className="w-full sm:w-32 bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white focus:border-emerald-500"
              value={newFlagDate}
              onChange={(e) => setNewFlagDate(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFaction())}
            />
            <button 
              type="button"
              onClick={handleAddFaction}
              className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded text-[10px] mono text-emerald-400 hover:bg-emerald-500/20 transition-colors"
            >
              ADD
            </button>
            <label className="cursor-pointer px-4 py-2 bg-slate-800 border border-slate-700 rounded text-[10px] mono text-slate-300 hover:bg-slate-700 transition-colors text-center">
              UPLOAD FLAG
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="image/*"
                onChange={handleFileUpload}
              />
            </label>
          </div>

          {customFlags.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {customFlags.map((flag, idx) => (
                <div key={idx} className="group/flag relative bg-slate-950 border border-slate-800 rounded p-2 flex items-center gap-2">
                  {flag.url ? (
                    <img src={flag.url} alt={flag.factionName} className="w-8 h-5 object-cover rounded-sm border border-slate-700" />
                  ) : (
                    <div className="w-8 h-5 bg-slate-800 rounded-sm border border-slate-700 flex items-center justify-center">
                      <svg className="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-7h.01M9 16h.01" />
                      </svg>
                    </div>
                  )}
                  <div className="flex flex-col truncate flex-1">
                    <span className="text-[10px] mono text-white truncate">{flag.factionName}</span>
                    {flag.existenceDate && (
                      <span className="text-[8px] mono text-slate-500 truncate">Est. {flag.existenceDate}</span>
                    )}
                  </div>
                  <button 
                    type="button"
                    onClick={() => removeFlag(idx)}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover/flag:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-slate-800/50">
           <div className="space-y-1">
            <label className="text-slate-500 mono text-[10px] uppercase tracking-widest font-bold">Start Year</label>
            <input
              type="text"
              required
              className="w-full bg-slate-900/50 border border-slate-700 rounded p-2 text-sm text-slate-300 focus:border-emerald-500/50 transition-colors"
              value={formData.startYear}
              onChange={(e) => setFormData({ ...formData, startYear: e.target.value })}
            />
          </div>
          <div className="space-y-1">
             <label className="text-slate-500 mono text-[10px] uppercase tracking-widest font-bold">End Year</label>
            <input
              type="text"
              required
              className="w-full bg-slate-900/50 border border-slate-700 rounded p-2 text-sm text-slate-300 focus:border-emerald-500/50 transition-colors"
              value={formData.endYear}
              onChange={(e) => setFormData({ ...formData, endYear: e.target.value })}
            />
          </div>
        </div>
        
        <details className="group/details">
            <summary className="cursor-pointer text-slate-500 mono text-[10px] uppercase hover:text-emerald-400 transition-colors flex items-center gap-2 mb-4 select-none">
                <svg className="w-3 h-3 transition-transform group-open/details:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                Advanced Parameters
            </summary>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pl-4 border-l border-slate-800 mb-2">
                <div className="space-y-1">
                    <label className="text-slate-500 mono text-[10px] uppercase tracking-widest font-bold">Theater</label>
                    <select
                    className="w-full bg-slate-900/50 border border-slate-700 rounded p-2 text-sm text-slate-300 focus:border-emerald-500/50"
                    value={formData.continent}
                    onChange={(e) => setFormData({ ...formData, continent: e.target.value })}
                    >
                    {continents.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                 <div className="space-y-1">
                    <label className="text-slate-500 mono text-[10px] uppercase tracking-widest font-bold">Events</label>
                    <input
                    type="number"
                    min="5"
                    max="300"
                    className="w-full bg-slate-900/50 border border-slate-700 rounded p-2 text-sm text-slate-300 focus:border-emerald-500/50"
                    value={formData.eventCount}
                    onChange={(e) => setFormData({ ...formData, eventCount: parseInt(e.target.value) || 10 })}
                    />
                </div>
                <div className="col-span-full space-y-1">
                     <label className="text-slate-500 mono text-[10px] uppercase tracking-widest font-bold">Additional Context</label>
                     <textarea
                        rows={2}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded p-2 text-sm text-slate-300 focus:border-emerald-500/50 resize-none"
                        value={formData.additionalContext}
                        onChange={(e) => setFormData({ ...formData, additionalContext: e.target.value })}
                     />
                </div>
            </div>
        </details>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full group relative flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-lg transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              GENERATING SCENARIO...
            </span>
          ) : (
            <>
              <span className="absolute left-4 opacity-30 group-hover:translate-x-1 transition-transform">&gt;&gt;&gt;</span>
              INITIATE SCENARIO
              <span className="absolute right-4 opacity-30 group-hover:-translate-x-1 transition-transform">&lt;&lt;&lt;</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default InputPanel;
