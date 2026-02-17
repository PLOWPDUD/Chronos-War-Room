
import React, { useState } from 'react';
import { GenerationResult, WarEvent, SavedScenario } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import TacticalMap from './TacticalMap';

interface Props {
  result: GenerationResult;
  onBack: () => void;
  onSave: (scenario: GenerationResult) => void;
}

const TimelineView: React.FC<Props> = ({ result, onBack, onSave }) => {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(result.events[0]?.id || null);
  const [isSaved, setIsSaved] = useState(false);

  const selectedEvent = result.events.find(e => e.id === selectedEventId) || result.events[0];

  const handleSave = () => {
    onSave(result);
    setIsSaved(true);
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${result.scenarioName.replace(/\s+/g, '_')}_INTEL.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const chartData = result.events.map((e, i) => ({
    name: e.date,
    impact: e.strategicImpact,
    index: i + 1,
    id: e.id
  }));

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-l-4 border-emerald-500 pl-6 py-2">
        <div className="flex-1">
          <span className="text-emerald-500 mono text-xs font-bold uppercase tracking-[0.3em]">Operational Deployment Report</span>
          <h2 className="text-4xl font-bold text-white mb-2">{result.scenarioName}</h2>
          <p className="text-slate-400 max-w-3xl leading-relaxed">{result.overview}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={handleExport}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md mono text-xs transition-colors flex items-center gap-2 border border-slate-700"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            EXPORT INTEL
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaved}
            className={`px-4 py-2 rounded-md mono text-xs transition-all flex items-center gap-2 border ${
              isSaved 
              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
              : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            {isSaved ? 'ARCHIVED' : 'SAVE TO ARCHIVE'}
          </button>
          <button 
            onClick={onBack}
            className="px-4 py-2 bg-slate-900 border border-slate-700 hover:bg-red-900/20 hover:border-red-500 text-slate-400 hover:text-red-400 rounded-md mono text-xs transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            EXIT DEBRIEF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Geographic Tactical Map */}
        <TacticalMap 
          events={result.events} 
          selectedEventId={selectedEventId} 
          onSelectEvent={setSelectedEventId} 
        />

        {/* Strategic Impact Chart */}
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-xl backdrop-blur-sm h-[300px] sm:h-[400px]">
          <h3 className="text-slate-500 mono text-[10px] uppercase font-bold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            Strategic Intensity Graph
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} onClick={(data) => data?.activePayload?.[0]?.payload?.id && setSelectedEventId(data.activePayload[0].payload.id)}>
              <defs>
                <linearGradient id="colorImpact" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="index" stroke="#475569" fontSize={10} tickLine={false} />
              <YAxis stroke="#475569" fontSize={10} tickLine={false} domain={[0, 10]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                itemStyle={{ color: '#10b981' }}
                labelStyle={{ color: '#94a3b8' }}
                cursor={{ stroke: '#10b981', strokeWidth: 1 }}
              />
              <Area type="monotone" dataKey="impact" stroke="#10b981" fillOpacity={1} fill="url(#colorImpact)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Timeline Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto max-h-[600px] pr-2 scrollbar-thin scrollbar-thumb-slate-700">
          <label className="text-slate-500 mono text-[10px] uppercase font-bold sticky top-0 bg-[#020617] py-2 z-10">Intelligence Sequence</label>
          {result.events.map((event, idx) => (
            <button
              key={event.id}
              onClick={() => setSelectedEventId(event.id)}
              className={`text-left p-4 rounded-lg border transition-all relative overflow-hidden group ${
                selectedEventId === event.id 
                  ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[inset_0_0_10px_rgba(16,185,129,0.1)]' 
                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              {selectedEventId === event.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
              )}
              <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] mono text-slate-500 uppercase tracking-tighter">PHASE {idx + 1}</span>
                <span className="text-[10px] mono text-emerald-400 bg-emerald-400/10 px-1.5 rounded">{event.date}</span>
              </div>
              <h4 className={`text-sm font-semibold truncate ${selectedEventId === event.id ? 'text-white' : 'text-slate-300'}`}>
                {event.title}
              </h4>
              <p className="text-[10px] text-slate-500 uppercase mono mt-1">{event.location}</p>
            </button>
          ))}
        </div>

        {/* Selected Event Detail */}
        <div className="lg:col-span-8 sticky top-8">
          {selectedEvent ? (
            <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-xl backdrop-blur-md relative overflow-hidden min-h-[500px] flex flex-col">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-slate-800 pb-4 gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 font-bold mono text-xl">
                    {result.events.indexOf(selectedEvent) + 1}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white leading-tight">{selectedEvent.title}</h3>
                    <p className="text-emerald-500 mono text-xs uppercase tracking-widest">{selectedEvent.date} // {selectedEvent.location}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-slate-500 mono text-[10px] uppercase">Strategic Weight</p>
                  <p className="text-3xl font-black text-white">{selectedEvent.strategicImpact}<span className="text-slate-600 text-sm">/10</span></p>
                </div>
              </div>

              <div className="flex-1 space-y-8">
                <div className="prose prose-invert max-w-none">
                  <p className="text-lg text-slate-300 leading-relaxed border-l-2 border-emerald-500/30 pl-6 py-1">
                    {selectedEvent.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6 border-t border-slate-800/50">
                  <div>
                    <h4 className="text-slate-500 mono text-[10px] uppercase font-bold mb-3 tracking-widest">Active Factions</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedEvent.factionsInvolved.map((f, i) => (
                        <span key={i} className="px-3 py-1 bg-slate-800/50 text-emerald-400 rounded-full text-[10px] mono border border-emerald-900/30">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-slate-500 mono text-[10px] uppercase font-bold mb-3 tracking-widest">Deployment Location</h4>
                    <p className="text-white mono text-sm font-bold flex items-center gap-2">
                      <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {selectedEvent.location}
                    </p>
                    <p className="text-slate-500 mono text-[10px] mt-1 ml-6">{selectedEvent.latitude.toFixed(4)}°N, {selectedEvent.longitude.toFixed(4)}°E</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center bg-slate-900/20 border border-dashed border-slate-800 rounded-xl py-20">
              <p className="text-slate-600 mono animate-pulse">Awaiting signal select...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimelineView;
