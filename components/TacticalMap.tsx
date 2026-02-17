
import React, { useMemo } from 'react';
import { WarEvent } from '../types';

interface Props {
  events: WarEvent[];
  selectedEventId: string | null;
  onSelectEvent: (id: string) => void;
}

// Fix: Define a local interface that extends WarEvent with the projected screen coordinates
interface ProjectedWarEvent extends WarEvent {
  x: number;
  y: number;
}

interface Cluster {
  id: string;
  x: number;
  y: number;
  // Fix: Use ProjectedWarEvent to ensure coordinate properties are accessible within the cluster
  events: ProjectedWarEvent[];
  isSingle: boolean;
}

const TacticalMap: React.FC<Props> = ({ events, selectedEventId, onSelectEvent }) => {
  const mapWidth = 800;
  const mapHeight = 400;

  const project = (lat: number, lng: number) => {
    // Basic Equirectangular approximation to match the background image
    // Map bounds: -180 to 180 longitude, 90 to -90 latitude
    const x = (lng + 180) * (mapWidth / 360);
    const y = (90 - lat) * (mapHeight / 180);
    return { x, y };
  };

  const clusters = useMemo(() => {
    // Fix: Explicitly type the projected events to ensure TS correctly identifies x and y properties
    const projectedEvents: ProjectedWarEvent[] = events.map(e => ({
      ...e,
      ...project(e.latitude, e.longitude)
    }));

    const result: Cluster[] = [];
    const threshold = 30; // pixels

    projectedEvents.forEach(event => {
      let found = false;
      for (const cluster of result) {
        // Fix: Coordinates x and y are now guaranteed on ProjectedWarEvent
        const dx = cluster.x - event.x;
        const dy = cluster.y - event.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < threshold) {
          cluster.events.push(event);
          // Recalculate center (average)
          // Fix: Coordinates are accessible on e because cluster.events contains ProjectedWarEvents
          cluster.x = cluster.events.reduce((sum, e) => sum + e.x, 0) / cluster.events.length;
          cluster.y = cluster.events.reduce((sum, e) => sum + e.y, 0) / cluster.events.length;
          cluster.isSingle = false;
          found = true;
          break;
        }
      }

      if (!found) {
        result.push({
          id: `cluster-${event.id}`,
          x: event.x,
          y: event.y,
          events: [event],
          isSingle: true
        });
      }
    });

    return result;
  }, [events]);

  return (
    <div className="bg-slate-950/80 border border-slate-800 rounded-xl overflow-hidden relative group h-[300px] sm:h-[400px]">
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
        <span className="text-emerald-500 mono text-[10px] uppercase font-bold tracking-widest bg-slate-950/80 px-2 py-1 rounded border border-emerald-500/30 w-fit">
          Geographic Deployment Map
        </span>
        <span className="text-slate-500 mono text-[9px] uppercase px-1">
          {clusters.length} Tactical Regions Detected
        </span>
      </div>
      
      {/* Background Map Image - Stylized with CSS filters for a tactical look */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/World_map_blank_without_borders.svg/2000px-World_map_blank_without_borders.svg.png")`,
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          // Invert to make land dark/slate, rotate hue to get cool tones, reduce brightness for background feel
          filter: 'invert(1) hue-rotate(180deg) brightness(0.6) contrast(1.1) saturate(0.5)',
          opacity: 0.4
        }}
      />

      <svg 
        viewBox={`0 0 ${mapWidth} ${mapHeight}`} 
        className="w-full h-full relative z-10"
      >
        {/* Grid Overlay */}
        <g stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2 2" opacity={0.5}>
          {[...Array(9)].map((_, i) => (
            <line key={`v-${i}`} x1={(i + 1) * (mapWidth / 10)} y1="0" x2={(i + 1) * (mapWidth / 10)} y2={mapHeight} />
          ))}
          {[...Array(4)].map((_, i) => (
            <line key={`h-${i}`} x1="0" y1={(i + 1) * (mapHeight / 5)} x2={mapWidth} y2={(i + 1) * (mapHeight / 5)} />
          ))}
        </g>

        {clusters.map((cluster) => {
          const isSelected = cluster.events.some(e => e.id === selectedEventId);
          const count = cluster.events.length;
          
          return (
            <g 
              key={cluster.id} 
              className="cursor-pointer transition-all duration-300"
              onClick={() => onSelectEvent(cluster.events[0].id)}
            >
              {isSelected && (
                <circle cx={cluster.x} cy={cluster.y} r={cluster.isSingle ? 12 : 18} fill="none" stroke="#10b981" strokeWidth="1" className="animate-ping" />
              )}
              
              <circle 
                cx={cluster.x} 
                cy={cluster.y} 
                r={cluster.isSingle ? (isSelected ? 6 : 4) : (isSelected ? 10 : 8)} 
                fill={isSelected ? "#10b981" : "#1e293b"} 
                stroke={isSelected ? "#fff" : "#475569"} 
                strokeWidth="1.5"
                className="hover:fill-emerald-400 transition-colors"
              />

              {!cluster.isSingle && (
                <text 
                  x={cluster.x} 
                  y={cluster.y + 3} 
                  fill="white" 
                  fontSize="8" 
                  textAnchor="middle"
                  className="mono font-bold pointer-events-none"
                >
                  {count}
                </text>
              )}

              {isSelected && (
                <g>
                  <rect 
                    x={cluster.x + 12} 
                    y={cluster.y - 12} 
                    width={120} 
                    height={24} 
                    rx="4" 
                    fill="#0f172a" 
                    stroke="#10b981" 
                    strokeWidth="0.5" 
                  />
                  <text 
                    x={cluster.x + 18} 
                    y={cluster.y + 4} 
                    fill="#10b981" 
                    fontSize="9" 
                    className="mono font-bold uppercase pointer-events-none"
                  >
                    {cluster.isSingle ? cluster.events[0].location : `${count} EVENTS IN REGION`}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
      
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent h-1/2 w-full animate-scan-slow opacity-20"></div>
      
      <style>{`
        @keyframes scan-slow {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(200%); }
        }
        .animate-scan-slow {
          animation: scan-slow 12s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default TacticalMap;
