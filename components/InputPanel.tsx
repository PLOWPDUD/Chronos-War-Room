
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
    continent: 'Europe',
    additionalContext: '',
    eventCount: 15,
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
          <label className="text-slate-400 mono text-xs uppercase tracking-widest font-bold">Operation Name</label>
          <input
            type="text"
            required
            placeholder="e.g., The Crimson Winter, Operation Zephyr..."
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-700"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-slate-400 mono text-xs uppercase tracking-widest font-bold">Theater of Operations</label>
            <select
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              value={formData.continent}
              onChange={(e) => setFormData({ ...formData, continent: e.target.value })}
            >
              {continents.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-slate-400 mono text-xs uppercase tracking-widest font-bold">Event Count (1-100)</label>
            <input
              type="number"
              min="1"
              max="100"
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              value={formData.eventCount}
              onChange={(e) => setFormData({ ...formData, eventCount: Math.min(100, Math.max(1, parseInt(e.target.value) || 1)) })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-slate-400 mono text-xs uppercase tracking-widest font-bold">Commencement Year</label>
            <input
              type="text"
              required
              placeholder="e.g., 400 BC, 2024 AD"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-700"
              value={formData.startYear}
              onChange={(e) => setFormData({ ...formData, startYear: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-slate-400 mono text-xs uppercase tracking-widest font-bold">Conclusion Year</label>
            <input
              type="text"
              required
              placeholder="e.g., 380 BC, 2030 AD"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-700"
              value={formData.endYear}
              onChange={(e) => setFormData({ ...formData, endYear: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-slate-400 mono text-xs uppercase tracking-widest font-bold">Primary Conflict / Event</label>
          <textarea
            required
            placeholder="Describe the inciting incident or main conflict..."
            rows={3}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-700 resize-none"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="space-y-1">
          <label className="text-slate-400 mono text-xs uppercase tracking-widest font-bold">Intelligence Context (Optional)</label>
          <textarea
            placeholder="Technology levels, specific political tensions, previous history..."
            rows={3}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-700 resize-none"
            value={formData.additionalContext}
            onChange={(e) => setFormData({ ...formData, additionalContext: e.target.value })}
          />
        </div>

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
              INITIALIZING...
            </span>
          ) : (
            <>
              <span className="absolute left-4 opacity-30 group-hover:translate-x-1 transition-transform">&gt;&gt;&gt;</span>
              LAUNCH SIMULATION! 🚀
              <span className="absolute right-4 opacity-30 group-hover:-translate-x-1 transition-transform">&lt;&lt;&lt;</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default InputPanel;
