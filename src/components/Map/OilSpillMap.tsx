import { useMemo } from 'react';
import type { OilSpillEvent, OilSpreadData, ContainmentOperation } from '../../types';
import { latLngToXY } from '../../utils/helpers';

interface OilSpillMapProps {
  event: OilSpillEvent;
  spreadData: OilSpreadData[];
  containmentOps?: ContainmentOperation[];
  showLegend?: boolean;
  height?: string;
}

export const OilSpillMap = ({
  event,
  spreadData,
  containmentOps = [],
  showLegend = true,
  height = '500px',
}: OilSpillMapProps) => {
  const latestSpread = spreadData[spreadData.length - 1];
  const centerLat = event.latitude;
  const centerLng = event.longitude;

  const mapData = useMemo(() => {
    const spillCenter = latLngToXY(centerLat, centerLng, centerLat, centerLng);
    
    const spreadCircles = spreadData.map((data, index) => {
      const pos = latLngToXY(data.centerLat, data.centerLng, centerLat, centerLng);
      const radius = Math.sqrt(data.spreadArea) * 30;
      const opacity = 0.3 + (index / spreadData.length) * 0.4;
      return { ...pos, radius, opacity, data };
    });

    const boomPaths = containmentOps.map((op) => {
      const points = op.coordinates.map((coord) =>
        latLngToXY(coord.lat, coord.lng, centerLat, centerLng)
      );
      const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
      return { pathD, status: op.status, type: op.boomType };
    });

    return { spillCenter, spreadCircles, boomPaths };
  }, [spreadData, containmentOps, centerLat, centerLng]);

  return (
    <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-ocean-800 via-ocean-700 to-ocean-900" style={{ height }}>
      <div className="absolute inset-0 opacity-20">
        <svg width="100%" height="100%" className="absolute inset-0">
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#ffffff" strokeWidth="0.5" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <svg width="100%" height="100%" viewBox="0 0 800 600" className="absolute inset-0">
        <defs>
          <radialGradient id="oilSpillGradient">
            <stop offset="0%" stopColor="#FF6B35" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#E63946" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#E63946" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="oilSpillGradient2">
            <stop offset="0%" stopColor="#FF6B35" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#F4D35E" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#F4D35E" stopOpacity="0" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {mapData.spreadCircles.map((circle, index) => (
          <g key={index}>
            <circle
              cx={circle.x}
              cy={circle.y}
              r={circle.radius}
              fill={index % 2 === 0 ? 'url(#oilSpillGradient)' : 'url(#oilSpillGradient2)'}
              opacity={circle.opacity}
              className="animate-pulse-slow"
              style={{ animationDelay: `${index * 0.5}s` }}
            />
            <circle
              cx={circle.x}
              cy={circle.y}
              r={circle.radius}
              fill="none"
              stroke="#FF6B35"
              strokeWidth="2"
              strokeDasharray="5,5"
              opacity={circle.opacity * 0.8}
            />
          </g>
        ))}

        {mapData.boomPaths.map((boom, index) => (
          <g key={index}>
            <path
              d={boom.pathD}
              fill="none"
              stroke={boom.status === 'deployed' ? '#06D6A0' : boom.status === 'deploying' ? '#F4D35E' : '#94a3b8'}
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
            />
            <path
              d={boom.pathD}
              fill="none"
              stroke={boom.status === 'deployed' ? '#06D6A0' : boom.status === 'deploying' ? '#F4D35E' : '#94a3b8'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.3"
            />
          </g>
        ))}

        <g filter="url(#glow)">
          <circle
            cx={mapData.spillCenter.x}
            cy={mapData.spillCenter.y}
            r="15"
            fill="#E63946"
            className="animate-pulse"
          />
          <circle
            cx={mapData.spillCenter.x}
            cy={mapData.spillCenter.y}
            r="25"
            fill="none"
            stroke="#E63946"
            strokeWidth="2"
            className="animate-spread"
          />
          <circle
            cx={mapData.spillCenter.x}
            cy={mapData.spillCenter.y}
            r="8"
            fill="#ffffff"
          />
        </g>

        {mapData.boomPaths.map((boom, index) => {
          const firstPoint = containmentOps[index]?.coordinates[0];
          if (!firstPoint) return null;
          const pos = latLngToXY(firstPoint.lat, firstPoint.lng, centerLat, centerLng);
          return (
            <g key={`label-${index}`}>
              <rect
                x={pos.x + 10}
                y={pos.y - 10}
                width="80"
                height="20"
                rx="4"
                fill="white"
                opacity="0.9"
              />
              <text
                x={pos.x + 15}
                y={pos.y + 4}
                className="text-xs fill-slate-700"
                fontSize="10"
                fontWeight="500"
              >
                {boom.type}
              </text>
            </g>
          );
        })}
      </svg>

      {showLegend && (
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur rounded-lg p-4 shadow-lg">
          <div className="text-sm font-semibold text-slate-800 mb-3">图例</div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-alert-red" />
              <span className="text-xs text-slate-600">溢油点</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-alert-orange/60 to-alert-red/40" />
              <span className="text-xs text-slate-600">油膜扩散范围</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-1 bg-alert-green rounded" />
              <span className="text-xs text-slate-600">已布放围油栏</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-1 bg-alert-yellow rounded" />
              <span className="text-xs text-slate-600">布放中围油栏</span>
            </div>
          </div>
          {latestSpread && (
            <div className="mt-3 pt-3 border-t border-slate-200">
              <div className="text-xs text-slate-500">
                最新监测: {latestSpread.recordTime}
              </div>
              <div className="text-xs text-slate-500">
                扩散面积: {latestSpread.spreadArea} km²
              </div>
              <div className="text-xs text-slate-500">
                扩散方向: {latestSpread.diffusionDirection}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur rounded-lg px-4 py-2 shadow-lg">
        <div className="text-sm font-semibold text-slate-800">{event.eventName}</div>
        <div className="text-xs text-slate-500">
          {event.location} ({centerLat.toFixed(4)}°N, {centerLng.toFixed(4)}°E)
        </div>
      </div>

      <div className="absolute top-4 right-4 flex gap-2">
        <button className="w-8 h-8 bg-white/95 backdrop-blur rounded-lg flex items-center justify-center shadow-lg hover:bg-white transition-colors">
          <span className="text-slate-600 font-bold">+</span>
        </button>
        <button className="w-8 h-8 bg-white/95 backdrop-blur rounded-lg flex items-center justify-center shadow-lg hover:bg-white transition-colors">
          <span className="text-slate-600 font-bold">−</span>
        </button>
      </div>
    </div>
  );
};
