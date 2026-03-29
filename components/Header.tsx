
import React, { useState, useEffect } from 'react';

const Header: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    // Show the prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setShowInstallBtn(false);
  };

  return (
    <header className="flex flex-col sm:flex-row justify-between items-center border-b border-emerald-900/30 pb-4 gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.2)]">
          <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white uppercase italic">CHRONOS <span className="text-emerald-500">WAR ROOM</span></h1>
          <p className="text-slate-500 mono text-[10px] tracking-widest uppercase">Geopolitical Sandbox v4.0.2</p>
        </div>
      </div>
      
      <div className="flex gap-4 items-center">
        {showInstallBtn && (
          <button 
            onClick={handleInstallClick}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white mono text-[10px] font-bold rounded transition-all shadow-[0_0_10px_rgba(16,185,129,0.2)] flex items-center gap-2"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            INSTALL APP
          </button>
        )}
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-slate-400 mono text-[10px] uppercase">Connection Status</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></span>
            <span className="text-emerald-400 mono text-xs">ENCRYPTED</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
