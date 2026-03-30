
import React, { useMemo, useEffect, useState } from 'react';
import { WarEvent } from '../types';
import * as d3 from 'd3';
import { getFlagForFaction } from '../services/flagService';
import FlagIcon from './FlagIcon';

interface Props {
  events: WarEvent[];
  selectedEventId: string | null;
  onSelectEvent: (id: string) => void;
}

interface ProjectedWarEvent extends WarEvent {
  x: number;
  y: number;
}

interface Cluster {
  id: string;
  x: number;
  y: number;
  events: ProjectedWarEvent[];
  isSingle: boolean;
}

interface City {
  name: string;
  lat: number;
  lng: number;
  rank: number; // 1: Global Hub, 2: Major City, 3: Regional City
}

const CITIES: City[] = [
  // Rank 1: Global Hubs (Always visible)
  { name: 'London', lat: 51.5074, lng: -0.1278, rank: 1 },
  { name: 'New York', lat: 40.7128, lng: -74.0060, rank: 1 },
  { name: 'Tokyo', lat: 35.6762, lng: 139.6503, rank: 1 },
  { name: 'Paris', lat: 48.8566, lng: 2.3522, rank: 1 },
  { name: 'Berlin', lat: 52.5200, lng: 13.4050, rank: 1 },
  { name: 'Moscow', lat: 55.7558, lng: 37.6173, rank: 1 },
  { name: 'Beijing', lat: 39.9042, lng: 116.4074, rank: 1 },
  { name: 'Washington DC', lat: 38.9072, lng: -77.0369, rank: 1 },
  
  // Rank 2: Major Cities (Visible at zoom > 1.5)
  { name: 'Cairo', lat: 30.0444, lng: 31.2357, rank: 2 },
  { name: 'Delhi', lat: 28.6139, lng: 77.2090, rank: 2 },
  { name: 'Sydney', lat: -33.8688, lng: 151.2093, rank: 2 },
  { name: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729, rank: 2 },
  { name: 'Los Angeles', lat: 34.0522, lng: -118.2437, rank: 2 },
  { name: 'Istanbul', lat: 41.0082, lng: 28.9784, rank: 2 },
  { name: 'Seoul', lat: 37.5665, lng: 126.9780, rank: 2 },
  { name: 'Mexico City', lat: 19.4326, lng: -99.1332, rank: 2 },
  { name: 'Buenos Aires', lat: -34.6037, lng: -58.3816, rank: 2 },
  { name: 'Lagos', lat: 6.5244, lng: 3.3792, rank: 2 },
  { name: 'Jakarta', lat: -6.2088, lng: 106.8456, rank: 2 },
  { name: 'Bangkok', lat: 13.7563, lng: 100.5018, rank: 2 },
  { name: 'Rome', lat: 41.9028, lng: 12.4964, rank: 2 },
  { name: 'Madrid', lat: 40.4168, lng: -3.7038, rank: 2 },
  { name: 'Toronto', lat: 43.6532, lng: -79.3832, rank: 2 },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777, rank: 2 },
  { name: 'Shanghai', lat: 31.2304, lng: 121.4737, rank: 2 },
  
  // Rank 3: Regional Cities (Visible at zoom > 3)
  { name: 'Warsaw', lat: 52.2297, lng: 21.0122, rank: 3 },
  { name: 'Kyiv', lat: 50.4501, lng: 30.5234, rank: 3 },
  { name: 'Tehran', lat: 35.6892, lng: 51.3890, rank: 3 },
  { name: 'Singapore', lat: 1.3521, lng: 103.8198, rank: 3 },
  { name: 'Hong Kong', lat: 22.3193, lng: 114.1694, rank: 3 },
  { name: 'Chicago', lat: 41.8781, lng: -87.6298, rank: 3 },
  { name: 'San Francisco', lat: 37.7749, lng: -122.4194, rank: 3 },
  { name: 'Vancouver', lat: 49.2827, lng: -123.1207, rank: 3 },
  { name: 'Cape Town', lat: -33.9249, lng: 18.4241, rank: 3 },
  { name: 'Nairobi', lat: -1.2921, lng: 36.8219, rank: 3 },
  { name: 'Dubai', lat: 25.2048, lng: 55.2708, rank: 3 },
  { name: 'Tel Aviv', lat: 32.0853, lng: 34.7818, rank: 3 },
  { name: 'Stockholm', lat: 59.3293, lng: 18.0686, rank: 3 },
  { name: 'Oslo', lat: 59.9139, lng: 10.7522, rank: 3 },
  { name: 'Helsinki', lat: 60.1699, lng: 24.9384, rank: 3 },
  { name: 'Vienna', lat: 48.2082, lng: 16.3738, rank: 3 },
  { name: 'Prague', lat: 50.0755, lng: 14.4378, rank: 3 },
  { name: 'Budapest', lat: 47.4979, lng: 19.0402, rank: 3 },
  { name: 'Athens', lat: 37.9838, lng: 23.7275, rank: 3 },
  { name: 'Lisbon', lat: 38.7223, lng: -9.1393, rank: 3 },
  { name: 'Dublin', lat: 53.3498, lng: -6.2603, rank: 3 },
  { name: 'Brussels', lat: 50.8503, lng: 4.3517, rank: 3 },
  { name: 'Amsterdam', lat: 52.3676, lng: 4.9041, rank: 3 },
  { name: 'Zurich', lat: 47.3769, lng: 8.5417, rank: 3 },
  { name: 'Geneva', lat: 46.2044, lng: 6.1432, rank: 3 },
  { name: 'Melbourne', lat: -37.8136, lng: 144.9631, rank: 3 },
  { name: 'Auckland', lat: -36.8485, lng: 174.7633, rank: 3 },
  { name: 'Santiago', lat: -33.4489, lng: -70.6693, rank: 3 },
  { name: 'Lima', lat: -12.0464, lng: -77.0428, rank: 3 },
  { name: 'Bogota', lat: 4.7110, lng: -74.0721, rank: 3 },
  { name: 'Caracas', lat: 10.4806, lng: -66.9036, rank: 3 },
  { name: 'Manila', lat: 14.5995, lng: 120.9842, rank: 3 },
  { name: 'Ho Chi Minh City', lat: 10.8231, lng: 106.6297, rank: 3 },
  { name: 'Kuala Lumpur', lat: 3.1390, lng: 101.6869, rank: 3 },
  { name: 'Taipei', lat: 25.0330, lng: 121.5654, rank: 3 },
  { name: 'Osaka', lat: 34.6937, lng: 135.5023, rank: 3 },
  { name: 'Baghdad', lat: 33.3152, lng: 44.3661, rank: 3 },
  { name: 'Riyadh', lat: 24.7136, lng: 46.6753, rank: 3 },
  { name: 'Casablanca', lat: 33.5731, lng: -7.5898, rank: 3 },
  { name: 'Johannesburg', lat: -26.2041, lng: 28.0473, rank: 3 }
];

const TacticalMap: React.FC<Props> = ({ events, selectedEventId, onSelectEvent }) => {
  const mapWidth = 800;
  const mapHeight = 400;
  const [geoData, setGeoData] = useState<any>(null);
  const [zoomTransform, setZoomTransform] = useState<d3.ZoomTransform>(d3.zoomIdentity);
  const svgRef = React.useRef<SVGSVGElement>(null);
  const zoomBehaviorRef = React.useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  useEffect(() => {
    // Fetch world GeoJSON for accurate borders
    fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson')
      .then(res => res.json())
      .then(data => setGeoData(data))
      .catch(err => console.error("Failed to load map data", err));
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 12])
      .on('zoom', (event) => {
        setZoomTransform(event.transform);
      });

    zoomBehaviorRef.current = zoom;
    svg.call(zoom);
  }, []);

  const projection = useMemo(() => {
    return d3.geoEquirectangular()
      .scale(127)
      .translate([mapWidth / 2, mapHeight / 2 + 30]);
  }, [mapWidth, mapHeight]);

  const pathGenerator = useMemo(() => {
    return d3.geoPath().projection(projection);
  }, [projection]);

  // Center on selected event
  useEffect(() => {
    if (!svgRef.current || !selectedEventId || !zoomBehaviorRef.current) return;

    const selectedEvent = events.find(e => e.id === selectedEventId);
    if (!selectedEvent) return;

    const coords = projection([selectedEvent.longitude, selectedEvent.latitude]);
    if (!coords) return;

    const [x, y] = coords;
    const svg = d3.select(svgRef.current);
    
    // We want to center (x, y) in the view
    // The view is mapWidth x mapHeight
    const k = Math.max(zoomTransform.k, 3); // Zoom in if not already zoomed in
    const tx = mapWidth / 2 - x * k;
    const ty = mapHeight / 2 - y * k;

    svg.transition()
      .duration(750)
      .call(zoomBehaviorRef.current.transform, d3.zoomIdentity.translate(tx, ty).scale(k));
  }, [selectedEventId, projection, mapWidth, mapHeight, events]);

  const handleZoomIn = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current).transition().call(zoomBehaviorRef.current.scaleBy, 1.5);
  };

  const handleZoomOut = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current).transition().call(zoomBehaviorRef.current.scaleBy, 0.66);
  };

  const handleResetZoom = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current).transition().call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
  };

  const clusters = useMemo(() => {
    const projectedEvents: ProjectedWarEvent[] = events.map(e => {
      const coords = projection([e.longitude, e.latitude]);
      return {
        ...e,
        x: coords ? coords[0] : 0,
        y: coords ? coords[1] : 0
      };
    });

    const result: Cluster[] = [];
    const threshold = 30 / zoomTransform.k; // Adjust threshold based on zoom

    projectedEvents.forEach(event => {
      let found = false;
      for (const cluster of result) {
        const dx = cluster.x - event.x;
        const dy = cluster.y - event.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < threshold) {
          cluster.events.push(event);
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
  }, [events, projection, zoomTransform.k]);

  const visibleCities = useMemo(() => {
    return CITIES.filter(city => {
      if (city.rank === 1) return true;
      if (city.rank === 2 && zoomTransform.k > 1.5) return true;
      if (city.rank === 3 && zoomTransform.k > 3.5) return true;
      return false;
    });
  }, [zoomTransform.k]);

  return (
    <div className="bg-slate-950/80 border border-slate-800 rounded-xl overflow-hidden relative group h-[300px] sm:h-[500px]">
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-1">
        <span className="text-emerald-500 mono text-[10px] uppercase font-bold tracking-widest bg-slate-950/80 px-2 py-1 rounded border border-emerald-500/30 w-fit">
          Geographic Deployment Map
        </span>
        <span className="text-slate-500 mono text-[9px] uppercase px-1">
          {clusters.length} Tactical Regions Detected | Zoom: {zoomTransform.k.toFixed(1)}x
        </span>
      </div>

      <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2">
        <button onClick={handleZoomIn} className="w-8 h-8 bg-slate-900 border border-slate-700 text-emerald-500 rounded flex items-center justify-center hover:bg-slate-800 transition-colors shadow-lg">+</button>
        <button onClick={handleZoomOut} className="w-8 h-8 bg-slate-900 border border-slate-700 text-emerald-500 rounded flex items-center justify-center hover:bg-slate-800 transition-colors shadow-lg">-</button>
        <button onClick={handleResetZoom} className="w-8 h-8 bg-slate-900 border border-slate-700 text-emerald-500 rounded flex items-center justify-center hover:bg-slate-800 transition-colors shadow-lg">⟲</button>
      </div>
      
      <svg 
        ref={svgRef}
        viewBox={`0 0 ${mapWidth} ${mapHeight}`} 
        className="w-full h-full relative z-10 cursor-move"
      >
        <g transform={zoomTransform.toString()}>
          {/* World Borders */}
          <g className="world-borders" opacity={0.4}>
            {geoData && geoData.features.map((feature: any, i: number) => (
              <path
                key={`country-${i}`}
                d={pathGenerator(feature) || ''}
                fill="#1e293b"
                stroke="#475569"
                strokeWidth={0.5 / zoomTransform.k}
                className="transition-colors hover:fill-slate-800"
              />
            ))}
          </g>

          {/* Grid Overlay */}
          <g stroke="#1e293b" strokeWidth={0.5 / zoomTransform.k} strokeDasharray="2 2" opacity={0.3}>
            {[...Array(9)].map((_, i) => (
              <line key={`v-${i}`} x1={(i + 1) * (mapWidth / 10)} y1="-1000" x2={(i + 1) * (mapWidth / 10)} y2="1000" />
            ))}
            {[...Array(9)].map((_, i) => (
              <line key={`h-${i}`} x1="-1000" y1={(i + 1) * (mapHeight / 5)} x2="2000" y2={(i + 1) * (mapHeight / 5)} />
            ))}
          </g>

          {/* Major Cities */}
          <g className="major-cities" opacity={0.6}>
            {visibleCities.map((city, i) => {
              const coords = projection([city.lng, city.lat]);
              if (!coords) return null;
              return (
                <g key={`city-${i}`}>
                  <circle cx={coords[0]} cy={coords[1]} r={1.5 / zoomTransform.k} fill="#475569" />
                  <text 
                    x={coords[0] + 3 / zoomTransform.k} 
                    y={coords[1] + 2 / zoomTransform.k} 
                    fill="#475569" 
                    fontSize={7 / zoomTransform.k} 
                    className="mono uppercase font-bold pointer-events-none"
                  >
                    {city.name}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Event Clusters */}
          {clusters.map((cluster) => {
            const isSelected = cluster.events.some(e => e.id === selectedEventId);
            const count = cluster.events.length;
            const primaryFaction = cluster.events[0].factionsInvolved[0];
            const date = cluster.events[0].date;
            
            return (
              <g 
                key={cluster.id} 
                className="cursor-pointer transition-all duration-300"
                onClick={() => onSelectEvent(cluster.events[0].id)}
              >
                {isSelected && (
                  <circle cx={cluster.x} cy={cluster.y} r={(cluster.isSingle ? 12 : 18) / zoomTransform.k} fill="none" stroke="#10b981" strokeWidth={1 / zoomTransform.k} className="animate-ping" />
                )}
                
                <circle 
                  cx={cluster.x} 
                  cy={cluster.y} 
                  r={(cluster.isSingle ? (isSelected ? 6 : 4) : (isSelected ? 10 : 8)) / zoomTransform.k} 
                  fill={isSelected ? "#10b981" : "#1e293b"} 
                  stroke={isSelected ? "#fff" : "#475569"} 
                  strokeWidth={1.5 / zoomTransform.k}
                  className="hover:fill-emerald-400 transition-colors"
                />

                {/* Flag Icon */}
                <foreignObject 
                  x={cluster.x - (10 / zoomTransform.k)} 
                  y={cluster.y - (25 / zoomTransform.k)} 
                  width={20 / zoomTransform.k} 
                  height={15 / zoomTransform.k}
                >
                  <FlagIcon faction={primaryFaction} date={date} size={20 / zoomTransform.k} />
                </foreignObject>

                {!cluster.isSingle && (
                  <text 
                    x={cluster.x} 
                    y={cluster.y + 3 / zoomTransform.k} 
                    fill="white" 
                    fontSize={8 / zoomTransform.k} 
                    textAnchor="middle"
                    className="mono font-bold pointer-events-none"
                  >
                    {count}
                  </text>
                )}

                {isSelected && (
                  <g>
                    <rect 
                      x={cluster.x + 12 / zoomTransform.k} 
                      y={cluster.y - 12 / zoomTransform.k} 
                      width={120 / zoomTransform.k} 
                      height={24 / zoomTransform.k} 
                      rx={4 / zoomTransform.k} 
                      fill="#0f172a" 
                      stroke="#10b981" 
                      strokeWidth={0.5 / zoomTransform.k} 
                    />
                    <text 
                      x={cluster.x + 18 / zoomTransform.k} 
                      y={cluster.y + 4 / zoomTransform.k} 
                      fill="#10b981" 
                      fontSize={9 / zoomTransform.k} 
                      className="mono font-bold uppercase pointer-events-none"
                    >
                      {cluster.isSingle ? cluster.events[0].location : `${count} EVENTS`}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
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
