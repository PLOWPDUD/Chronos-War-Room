
import React, { useState, useEffect } from 'react';
import { getFlagForFaction } from '../services/flagService';

interface Props {
  faction: string;
  date: string;
  size?: number;
  className?: string;
}

const FlagIcon: React.FC<Props> = ({ faction, date, size = 20, className = "" }) => {
  const [flagUrl, setFlagUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchFlag = async () => {
      const url = await getFlagForFaction(faction, date);
      setFlagUrl(url);
    };
    fetchFlag();
  }, [faction, date]);

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
