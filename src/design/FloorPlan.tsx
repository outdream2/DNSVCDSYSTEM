import React from 'react';
import { PANEL_DATA } from '../data/panelData';
import { ActivePanel } from '../data/types';

function FloorPlan({
  cameraPos,
  panels,
  targetSubIds,
  targetPanels,
}: {
  cameraPos: { x: number, z: number, rotation: number },
  panels: any[],
  targetSubIds: number[],
  targetPanels: ActivePanel[],
}) {
  // Use a targeted viewbox designed to fill the screen with just the KOEN wall and the panels
  const width = 2400;
  const height = 3600;

  const NORMAL_SCALE = 132;

  const mapX2D = (z: number) => {
    return 1200 + z * 118;
  };

  const mapY2D = (x: number) => {
    // Top-most wall in 3D is X=35. Map it near 0 to shift the whole layout UPwards
    if (x >= 11) {
      return 10 + (35 - x) * NORMAL_SCALE;
    }
    // For anything below x=11 (where the camera drops back to -14), squash the coordinate slightly
    const yAt11 = 10 + (35 - 11) * NORMAL_SCALE;
    return yAt11 + (11 - x) * 20;
  };

  return (
    <div className="w-full h-full bg-white flex flex-col items-center p-2 pt-3 relative overflow-hidden border-l border-gray-200">
      {/* Header Info */}
      <div className="w-full flex items-center justify-center mb-3 z-30 relative">
        <div className="w-56 mt-4">
          <div className="bg-white rounded-xl w-full overflow-hidden shadow-lg">
            <img src="/logo.png" alt="KOEN" className="w-full h-16 object-cover" />
          </div>
        </div>
      </div>

      <div className="relative group w-full flex-1 flex justify-center items-center overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full bg-gray-50 rounded-xl border border-gray-200 shadow-inner"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Technical Grid - Subtle */}
          <defs>
            <pattern id="grid-at-glance" width={100} height={100} patternUnits="userSpaceOnUse">
              <path d={`M 100 0 L 0 0 0 100`} fill="none" stroke="rgba(37, 99, 235, 0.07)" strokeWidth="1" />
              <circle cx="50" cy="50" r="1.5" fill="rgba(37, 99, 235, 0.1)" />
            </pattern>
            <radialGradient id="userGlow-at-glance" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="panel-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>
            <linearGradient id="selected-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#b91c1c" stopOpacity="0.5" />
            </linearGradient>
            <filter id="glow-eff" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-at-glance)" />

          {/* Environment Walls (Schematic) */}
          {/* Top block removed to maximize space for panels */}

          {/* Panels */}
          {panels.map((p) => {
            const isSelectedUpper = targetSubIds.includes(p.upperId);
            const isSelectedLower = targetSubIds.includes(p.lowerId);
            const isSelected = isSelectedUpper || isSelectedLower;

            // Scaled based on physical dimensions allowing maximum vertical height
            const panelWidth = 480;
            const panelHeight = 250;

            const xPos = mapX2D(p.position[2]) - panelWidth / 2;
            const yPos = mapY2D(p.position[0]) - panelHeight / 2;

            return (
              <g key={p.id}>
                {isSelected && (
                  <rect
                    x={xPos - 12}
                    y={yPos - 12}
                    width={panelWidth + 24}
                    height={panelHeight + 24}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="6"
                    rx="8"
                    filter="url(#glow-eff)"
                    className="animate-pulse"
                  />
                )}
                <rect
                  x={xPos}
                  y={yPos}
                  width={panelWidth}
                  height={panelHeight}
                  fill={isSelected ? "url(#selected-gradient)" : "url(#panel-gradient)"}
                  stroke={isSelected ? "#ef4444" : "#2563eb"}
                  strokeWidth={isSelected ? "4" : "3"}
                  rx="6"
                  className="transition-all duration-300"
                />

                {/* Visual Top Highlight Edge for depth */}
                <rect
                  x={xPos + 2}
                  y={yPos + 2}
                  width={panelWidth - 4}
                  height={panelHeight * 0.15}
                  fill="rgba(255,255,255,0.06)"
                  rx="4"
                  className="pointer-events-none"
                />

                {/* 상단: upperId + unitId + name */}
                <text x={xPos + 18} y={yPos + 54} fontSize="54" fill={isSelectedUpper ? "#dc2626" : "#1e40af"} textAnchor="start" alignmentBaseline="middle" className="font-mono pointer-events-none select-none">
                  {String(p.upperId).padStart(2, '0')}
                </text>
                <text x={xPos + 112} y={yPos + 54} fontSize="52" fill={isSelectedUpper ? "#dc2626" : "#2563eb"} textAnchor="start" alignmentBaseline="middle" className="font-mono pointer-events-none select-none">
                  {PANEL_DATA[p.upperId]?.unitId ?? ''}
                </text>
                <text x={xPos + 18} y={yPos + 106} fontSize="42" fill={isSelectedUpper ? "#ef4444" : "#64748b"} textAnchor="start" alignmentBaseline="middle" className="pointer-events-none select-none">
                  {(PANEL_DATA[p.upperId]?.name ?? '').slice(0, 28)}
                </text>

                {/* 하단: lowerId + unitId + name */}
                {p.upperId !== p.lowerId && (
                  <>
                    <text x={xPos + 18} y={yPos + 158} fontSize="54" fill={isSelectedLower ? "#dc2626" : "#1e40af"} textAnchor="start" alignmentBaseline="middle" className="font-mono pointer-events-none select-none">
                      {String(p.lowerId).padStart(2, '0')}
                    </text>
                    <text x={xPos + 112} y={yPos + 158} fontSize="52" fill={isSelectedLower ? "#dc2626" : "#2563eb"} textAnchor="start" alignmentBaseline="middle" className="font-mono pointer-events-none select-none">
                      {PANEL_DATA[p.lowerId]?.unitId ?? ''}
                    </text>
                    <text x={xPos + 18} y={yPos + 210} fontSize="42" fill={isSelectedLower ? "#ef4444" : "#64748b"} textAnchor="start" alignmentBaseline="middle" className="pointer-events-none select-none">
                      {(PANEL_DATA[p.lowerId]?.name ?? '').slice(0, 28)}
                    </text>
                  </>
                )}
              </g>
            );
          })}

          {/* Camera Indicator (User Position) - Enhanced Red Dot */}
          <g transform={`translate(${mapX2D(0)}, ${mapY2D(cameraPos.x)})`}>
            {/* The glow is larger to fit the massive scale */}
            <circle r="160" fill="url(#userGlow-at-glance)" />
            {/* Main Red Dot (Only position, no gaze) */}
            <circle r="36" fill="#ef4444" stroke="#fff" strokeWidth="8" className="animate-pulse shadow-lg" />
            <circle r="14" fill="#fff" opacity="0.9" />
          </g>
        </svg>
      </div>

    </div>
  );
}

export default FloorPlan;
