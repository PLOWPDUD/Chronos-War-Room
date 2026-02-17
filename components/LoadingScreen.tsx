
import React, { useState, useEffect } from 'react';

const LoadingScreen: React.FC = () => {
  const [dots, setDots] = useState('');
  const [messageIndex, setMessageIndex] = useState(0);

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

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-12 py-20">
      <div className="relative">
        {/* Radar-like loading animation */}
        <div className="w-48 h-48 border-4 border-emerald-500/20 rounded-full relative flex items-center justify-center">
          <div className="absolute inset-0 border-4 border-transparent border-t-emerald-500 rounded-full animate-spin"></div>
          <div className="absolute inset-4 border border-emerald-500/40 rounded-full animate-pulse"></div>
          <svg className="w-16 h-16 text-emerald-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
      </div>

      <div className="text-center space-y-4 max-w-md">
        <h3 className="text-xl font-bold text-white uppercase tracking-widest animate-pulse">
          Simulating Intel{dots}
        </h3>
        <p className="text-emerald-500 mono text-sm h-6">
          {messages[messageIndex]}
        </p>
        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
          <div className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981] animate-progress"></div>
        </div>
      </div>

      <style>{`
        @keyframes progress {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        .animate-progress {
          animation: progress 20s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
