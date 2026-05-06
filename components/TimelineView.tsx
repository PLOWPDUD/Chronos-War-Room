
import React, { useState, useRef, useEffect } from 'react';
import { GenerationResult, WarEvent, SavedScenario } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import TacticalMap from './TacticalMap';
import FlagIcon from './FlagIcon';

interface Props {
  result: GenerationResult;
  onBack: () => void;
  onSave: (scenario: GenerationResult) => void;
  onContinue: (count: number, directive?: string) => void;
  isContinuing?: boolean;
  onUpdateFactions: (factions: Record<string, { flagUrl?: string; existenceDate?: string }>) => void;
}

const TimelineView: React.FC<Props> = ({ result, onBack, onSave, onContinue, isContinuing, onUpdateFactions }) => {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(result.events[0]?.id || null);
  const [isSaved, setIsSaved] = useState(false);
  const [showContinueOptions, setShowContinueOptions] = useState(false);
  const [showFactionIntel, setShowFactionIntel] = useState(false);
  const [directive, setDirective] = useState('');
  const [newFlagFaction, setNewFlagFaction] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const eventRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const prevEventsLength = useRef(result.events.length);

  useEffect(() => {
    if (!isContinuing && result.events.length > prevEventsLength.current) {
      // Find the first new event (it should be at index prevEventsLength.current)
      const firstNewEventCode = result.events[prevEventsLength.current];
      if (firstNewEventCode) {
        setSelectedEventId(firstNewEventCode.id);
      }
    }
    prevEventsLength.current = result.events.length;
  }, [isContinuing, result.events]);

  const selectedEvent = result.events.find(e => e.id === selectedEventId) || result.events[0];

  const getFlagUrl = (faction: string) => {
    return result.factionFlags?.[faction];
  };

  useEffect(() => {
    if (selectedEventId && eventRefs.current[selectedEventId]) {
      eventRefs.current[selectedEventId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedEventId]);

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

  const handleFlagUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !newFlagFaction) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      onUpdateFactions({ [newFlagFaction]: { flagUrl: base64String } });
      setNewFlagFaction('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  const allFactions = Array.from(new Set(result.events.flatMap(e => e.factionsInvolved)));

  const chartData = result.events.map((e, i) => ({
    name: e.date,
    impact: e.strategicImpact,
    index: i + 1,
    id: e.id
  }));

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      {isContinuing && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center gap-6 animate-in fade-in">
          <div className="relative">
            <div className="w-24 h-24 border-2 border-emerald-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-t-2 border-emerald-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-8 h-8 text-emerald-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold text-white mono uppercase tracking-widest">Recalculating Causal Chains</h3>
            <p className="text-slate-400 mono text-xs animate-pulse">INTELLIGENCE NODES ARE BEING EXPANDED BY THE TACTICAL GRID...</p>
            {directive && (
              <div className="mt-4 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded text-[10px] text-emerald-400 mono max-w-md mx-auto">
                <span className="text-slate-500">DIRECTIVE:</span> {directive}
              </div>
            )}
          </div>
        </div>
      )}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-l-4 border-emerald-500 pl-6 py-2">
        <div className="flex-1">
          <span className="text-emerald-500 mono text-xs font-bold uppercase tracking-[0.3em]">Operational Deployment Report</span>
          <h2 className="text-4xl font-bold text-white mb-2">{result.scenarioName}</h2>
          <p className="text-slate-400 max-w-3xl leading-relaxed">{result.overview}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <button 
              onClick={() => setShowFactionIntel(!showFactionIntel)}
              className="px-4 py-2 bg-slate-900 border border-slate-700 hover:border-emerald-500/50 text-slate-300 rounded-md mono text-xs transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-7h.01M9 16h.01" />
              </svg>
              FACTION INTEL
            </button>

            {showFactionIntel && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl z-50 p-4 animate-in slide-in-from-top-2 flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h3 className="text-xs font-bold text-white mono uppercase tracking-widest">Active Intelligence</h3>
                  <button onClick={() => setShowFactionIntel(false)} className="text-slate-500 hover:text-white">×</button>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800">
                  {allFactions.map(faction => (
                    <div key={faction} className="flex flex-col gap-2 bg-slate-950 p-2 rounded border border-slate-800">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <FlagIcon faction={faction} date={result.events[0]?.date || ''} size={20} customUrl={getFlagUrl(faction)} />
                          <span className="text-[10px] mono text-slate-300 truncate max-w-[120px]">{faction}</span>
                        </div>
                        <button 
                          onClick={() => {
                            setNewFlagFaction(faction);
                            fileInputRef.current?.click();
                          }}
                          className="text-[9px] mono text-emerald-500 hover:underline"
                        >
                          UPDATE FLAG
                        </button>
                      </div>
                      <div className="flex items-center gap-2 border-t border-slate-900 pt-2">
                        <span className="text-[8px] mono text-slate-500 uppercase">EXISTENCE:</span>
                        <input 
                          type="text"
                          defaultValue={result.factionIntel?.[faction]?.existenceDate || ''}
                          onBlur={(e) => onUpdateFactions({ [faction]: { existenceDate: e.target.value } })}
                          placeholder="e.g. 1940 BC"
                          className="flex-1 bg-transparent border-none text-[9px] mono text-slate-400 focus:ring-0 p-0"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-800">
                   <p className="text-[9px] text-slate-600 leading-tight mb-3 italic">Uploaded flags will be embedded in the tactical system and exported with intelligence files.</p>
                   <input 
                      type="file" 
                      ref={fileInputRef}
                      className="hidden" 
                      accept="image/*"
                      onChange={handleFlagUpload}
                    />
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button 
              onClick={() => setShowContinueOptions(!showContinueOptions)}
              disabled={isContinuing}
              className={`px-4 py-2 bg-slate-900 border border-emerald-500/30 hover:border-emerald-500 text-emerald-400 rounded-md mono text-xs transition-all flex items-center gap-2 group ${isContinuing ? 'opacity-50' : ''}`}
            >
              <svg className={`w-4 h-4 group-hover:rotate-180 transition-transform ${isContinuing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {isContinuing ? 'EXPANDING SEQUENCE...' : 'CONTINUE SCENARIO'}
            </button>
            
            {showContinueOptions && !isContinuing && (
              <div className="absolute top-full right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl z-50 p-4 animate-in slide-in-from-top-2 flex flex-col gap-4">
                <div>
                  <label className="text-[10px] mono text-slate-500 mb-2 uppercase tracking-tighter block">Strategic Directive (Optional)</label>
                  <textarea 
                    value={directive}
                    onChange={(e) => setDirective(e.target.value)}
                    placeholder="E.g. Focus on naval escalation, include a peace treaty, or shift to the 21st century..."
                    className="w-full h-24 bg-slate-950 border border-slate-800 rounded p-2 text-[10px] text-slate-300 mono focus:border-emerald-500 focus:outline-none resize-none"
                  />
                </div>
                
                <div>
                  <p className="text-[10px] mono text-slate-500 mb-2 uppercase tracking-tighter">Add Intelligence Nodes</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[5, 10, 20].map(count => (
                      <button 
                        key={count}
                        onClick={() => {
                          onContinue(count, directive);
                          setShowContinueOptions(false);
                          setDirective('');
                        }}
                        className="px-2 py-1.5 bg-slate-800 hover:bg-emerald-500/10 border border-slate-700 hover:border-emerald-500/50 text-emerald-500 mono text-[10px] transition-all rounded text-center"
                      >
                        +{count}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <p className="text-[9px] text-slate-600 leading-tight">Expanded sequences will build upon the existing causal chain using the provided directive.</p>
                </div>
              </div>
            )}
          </div>
          
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
              ref={(el) => { eventRefs.current[event.id] = el; }}
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
                <div className="flex items-center gap-2">
                  <FlagIcon faction={event.factionsInvolved[0]} date={event.date} size={14} customUrl={getFlagUrl(event.factionsInvolved[0])} />
                  <span className="text-[10px] mono text-slate-500 uppercase tracking-tighter">PHASE {idx + 1}</span>
                </div>
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
                  <div className="relative">
                    <div className="w-12 h-12 rounded-lg bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 font-bold mono text-xl">
                      {result.events.indexOf(selectedEvent) + 1}
                    </div>
                    <div className="absolute -bottom-1 -right-1">
                      <FlagIcon faction={selectedEvent.factionsInvolved[0]} date={selectedEvent.date} size={24} className="border-2 border-slate-900" customUrl={getFlagUrl(selectedEvent.factionsInvolved[0])} />
                    </div>
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
                        <div key={i} className="flex items-center gap-2 px-3 py-1 bg-slate-800/50 text-emerald-400 rounded-full text-[10px] mono border border-emerald-900/30">
                          <FlagIcon faction={f} date={selectedEvent.date} size={12} customUrl={getFlagUrl(f)} />
                          {f}
                        </div>
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
