
import React, { useState, useEffect } from 'react';
import { getFlagForFaction } from '../services/flagService';

interface Props {
  faction: string;
  date: string;
  size?: number;
  className?: string;
  customUrl?: string;
}

const FlagIcon: React.FC<Props> = ({ faction, date, size = 20, className = "", customUrl }) => {
  const [flagUrl, setFlagUrl] = useState<string | null>(customUrl || null);

  useEffect(() => {
    const fetchFlag = async () => {
      // If customUrl is provided, it might be an ISO code or a full URL
      const source = customUrl || faction;
      const url = await getFlagForFaction(source, date);
      setFlagUrl(url);
    };
    fetchFlag();
  }, [faction, date, customUrl]);

  if (!flagUrl) return <div style={{ width: size, height: size * 0.66 }} className={`bg-slate-800 animate-pulse rounded-sm ${className}`} />;

  return (
    <img 
      src={flagUrl} 
      alt={`${faction} flag`} 
      referrerPolicy="no-referrer"
      className={`rounded-sm shadow-sm object-cover border border-white/20 ${className}`}
      style={{ width: size, height: size * 0.66 }}
    />
  );
};

export default FlagIcon;
