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
  // 뷰박스 크기 최적화 (높이 4000 유지)
  const width = 2400;
  const height = 4000;

  const NORMAL_SCALE = 140;

  const mapX2D = (z: number) => {
    // 3D aisle is around z=0. Map it to horizontal center 1200.
    return 1200 + z * 120;
  };

  const mapY2D = (x: number) => {
    // 3D X coordinates: room is roughly from -24 to 35. 
    // Shift EVERYTHING up by reducing the top offset (60 -> -150)
    if (x >= 11) {
      return -150 + (35 - x) * NORMAL_SCALE;
    }
    const yAt11 = -150 + (35 - 11) * NORMAL_SCALE;
    return yAt11 + (11 - x) * 40;
  };

  return (
    <div className="w-full h-full bg-slate-50 flex flex-col items-center p-4 relative overflow-hidden border-l border-gray-200">
      {/* 로고 영역 (이미지 상단 참고) */}
      <div className="w-full flex items-center justify-between mb-4 z-30 relative px-2">
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-none">Floor Plan Overview</span>
        </div>
      </div>

      <div className="relative group w-full flex-1 flex justify-center items-center overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-sm">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <pattern id="grid-pattern" width={120} height={120} patternUnits="userSpaceOnUse">
              <path d="M 120 0 L 0 0 0 120" fill="none" stroke="#f1f5f9" strokeWidth="2" />
            </pattern>
            
            <filter id="card-shadow" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feOffset dx="0" dy="3" result="offsetBlur" />
              <feFlood floodColor="#64748b" floodOpacity="0.08" result="offsetColor" />
              <feComposite in="offsetColor" in2="offsetBlur" operator="in" result="shadow" />
              <feComposite in="SourceGraphic" in2="shadow" operator="over" />
            </filter>

            {/* 선택 시 붉은색 강렬한 발광 효과 */}
            <filter id="active-glow-red" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="15" result="blur" />
              <feFlood floodColor="#ef4444" floodOpacity="0.6" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="glow" />
              <feComposite in="SourceGraphic" in2="glow" operator="over" />
            </filter>
          </defs>

          <rect width="100%" height="100%" fill="url(#grid-pattern)" />

          {panels.map((p) => {
            const isSelectedUpper = targetSubIds.includes(p.upperId);
            const isSelectedLower = targetSubIds.includes(p.lowerId);
            const isSelected = isSelectedUpper || isSelectedLower;

            const panelWidth = 440;
            const panelHeight = 250;

            const xPos = mapX2D(p.position[2]) - panelWidth / 2;
            const yPos = mapY2D(p.position[0]) - panelHeight / 2;

            return (
              <g key={p.id} filter={isSelected ? "url(#active-glow-red)" : "url(#card-shadow)"}>
                <rect
                  x={xPos}
                  y={yPos}
                  width={panelWidth}
                  height={panelHeight}
                  fill="white"
                  stroke={isSelected ? "#ef4444" : "#94a3b8"}
                  strokeWidth={isSelected ? "6" : "3"}
                  rx="14"
                  className={isSelected ? "animate-pulse" : "transition-all duration-300"}
                >
                  {isSelected && (
                    <animate
                      attributeName="stroke-opacity"
                      values="1;0.4;1"
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                  )}
                </rect>

                <line x1={xPos + 20} y1={yPos + panelHeight/2} x2={xPos + panelWidth - 20} y2={yPos + panelHeight/2} stroke="#f1f5f9" strokeWidth="2" />

                <g>
                  <text x={xPos + 25} y={yPos + 65} fontSize="46" fontWeight="900" fill={isSelectedUpper ? "#ef4444" : "#2563eb"} textAnchor="start" className="font-mono">
                    {p.upperId}
                  </text>
                  <text x={xPos + 95} y={yPos + 65} fontSize="38" fontWeight="800" fill="#0f172a" textAnchor="start" className="font-sans tracking-tight">
                    {PANEL_DATA[p.upperId]?.unitId ?? ''}
                  </text>
                  <text x={xPos + 95} y={yPos + 102} fontSize="28" fontWeight="600" fill="#94a3b8" textAnchor="start" className="font-sans">
                    {(PANEL_DATA[p.upperId]?.name ?? '').slice(0, 20)}
                  </text>
                </g>

                {p.upperId !== p.lowerId && (
                  <g>
                    <text x={xPos + 25} y={yPos + 190} fontSize="46" fontWeight="900" fill={isSelectedLower ? "#ef4444" : "#2563eb"} textAnchor="start" className="font-mono">
                      {p.lowerId}
                    </text>
                    <text x={xPos + 95} y={yPos + 190} fontSize="38" fontWeight="800" fill="#0f172a" textAnchor="start" className="font-sans tracking-tight">
                      {PANEL_DATA[p.lowerId]?.unitId ?? ''}
                    </text>
                    <text x={xPos + 95} y={yPos + 227} fontSize="28" fontWeight="600" fill="#94a3b8" textAnchor="start" className="font-sans">
                      {(PANEL_DATA[p.lowerId]?.name ?? '').slice(0, 20)}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* 카메라 표시 (깔끔한 레드 닷) */}
          <g transform={`translate(${mapX2D(cameraPos.z)}, ${mapY2D(cameraPos.x)})`}>
            {/* 은은한 광채 */}
            <circle r="120" fill="#ef4444" fillOpacity="0.15" />
            <circle r="60" fill="#ef4444" fillOpacity="0.25" />
            {/* 메인 도트 */}
            <circle r="30" fill="#ef4444" stroke="white" strokeWidth="10" className="animate-pulse shadow-xl" />
          </g>
        </svg>
      </div>
    </div>
  );
}

export default FloorPlan;
