
import React, { useState, useEffect } from 'react';

const HISTORICAL_FLAGS = [
  'https://upload.wikimedia.org/wikipedia/en/a/ae/Flag_of_the_United_Kingdom.svg',
  'https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg',
  'https://upload.wikimedia.org/wikipedia/commons/a/a9/Flag_of_the_Soviet_Union.svg',
  'https://upload.wikimedia.org/wikipedia/commons/7/77/Flag_of_Germany_%281935%E2%80%931945%29.svg',
  'https://upload.wikimedia.org/wikipedia/commons/5/54/Flag_of_the_Imperial_Japanese_Army.svg',
  'https://upload.wikimedia.org/wikipedia/en/c/c3/Flag_of_France.svg',
  'https://upload.wikimedia.org/wikipedia/en/1/12/Flag_of_Poland.svg',
  'https://upload.wikimedia.org/wikipedia/en/0/03/Flag_of_Italy.svg',
  'https://upload.wikimedia.org/wikipedia/commons/f/fa/Flag_of_the_People%27s_Republic_of_China.svg',
];

const LoadingScreen: React.FC = () => {
  const [dots, setDots] = useState('');
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [flagIndex, setFlagIndex] = useState(0);

  const messages = [
    "Establishing neural link with strategic archive...",
    "Calibrating historical outcome probabilities...",
    "Synchronizing geopolitical vectors...",
    "Parsing intelligence from multiple timelines...",
    "Simulating battlefield dynamics...",
    "Generating civilian impact assessments...",
    "Finalizing scenario encryption..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % messages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [messages.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setFlagIndex(prev => (prev + 1) % HISTORICAL_FLAGS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Simulated progress
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 99) return 99;
        const increment = Math.random() * 5;
        return Math.min(99, prev + increment);
      });
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-12 py-20 relative overflow-hidden">
      {/* Background Flag Rotation */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
        <img 
          src={HISTORICAL_FLAGS[flagIndex]} 
          alt="Historical Background" 
          className="w-[80%] h-auto object-contain transition-opacity duration-1000"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Tactical Data Readouts (Floating) */}
      <div className="absolute top-10 left-10 text-[8px] mono text-emerald-500/40 uppercase space-y-1 hidden lg:block">
        <p>VECTOR_SYNC: ACTIVE</p>
        <p>LATENCY: 14MS</p>
        <p>ENCRYPTION: AES-256-GCM</p>
        <p>TIMELINE_REF: {Math.random().toString(16).slice(2, 10).toUpperCase()}</p>
      </div>

      <div className="absolute bottom-10 right-10 text-[8px] mono text-emerald-500/40 uppercase text-right hidden lg:block">
        <p>ARCHIVE_QUERY: SUCCESS</p>
        <p>MODEL_CONFIDENCE: 98.4%</p>
        <p>HEURISTIC_ENGINE: V4.2</p>
        <p>SESSION_ID: {Math.random().toString(36).slice(2, 12).toUpperCase()}</p>
      </div>

      <div className="relative">
        {/* Radar-like loading animation */}
        <div className="w-56 h-56 border-4 border-emerald-500/10 rounded-full relative flex items-center justify-center">
          {/* Scanning Line */}
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <div className="absolute top-1/2 left-1/2 w-[200%] h-[1px] bg-emerald-500/40 origin-left animate-scan"></div>
          </div>
          
          <div className="absolute inset-0 border-4 border-transparent border-t-emerald-500 rounded-full animate-spin duration-[3s]"></div>
          <div className="absolute inset-4 border border-emerald-500/20 rounded-full"></div>
          <div className="absolute inset-12 border border-emerald-500/10 rounded-full"></div>
          
          <div className="flex flex-col items-center gap-1 z-10">
            <svg className="w-12 h-12 text-emerald-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="mono text-emerald-500 font-bold text-xl">{Math.floor(progress)}%</span>
          </div>
        </div>
      </div>

      <div className="text-center space-y-6 max-w-md w-full px-6">
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white uppercase tracking-[0.3em] animate-pulse">
            Simulating Intel{dots}
          </h3>
          <p className="text-emerald-500/80 mono text-[10px] h-4 uppercase tracking-wider">
            {messages[messageIndex]}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between mono text-[9px] text-slate-500 uppercase">
            <span>Data Stream</span>
            <span>{progress === 99 ? 'Finalizing...' : 'Processing...'}</span>
          </div>
          <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden border border-slate-800/50">
            <div 
              className="h-full bg-emerald-500 shadow-[0_0_15px_#10b981] transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-scan {
          animation: scan 4s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
