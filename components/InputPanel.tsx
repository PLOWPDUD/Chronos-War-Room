
import React, { useState } from 'react';
import { ScenarioInput } from '../types';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.description || isSubmitting) return;
    onGenerate(formData);
  };

  const continents = ['North America', 'South America', 'Europe', 'Asia', 'Africa', 'Oceania', 'Antarctica', 'Global'];

  return (
    <div className="w-full max-w-2xl bg-slate-900/40 border border-slate-800 p-6 sm:p-8 rounded-xl backdrop-blur-sm shadow-2xl relative overflow-hidden group">
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>

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
                    max="50"
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
              RUNNING SIMULATION...
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
