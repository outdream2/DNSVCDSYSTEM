import React, { useState, useMemo, useEffect, Suspense, useCallback, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { LayoutDashboard, Box, AlertCircle, History, Settings, Headphones } from 'lucide-react';

import { ActivePanel, Operation } from './data/types';
import { PANEL_DATA } from './data/panelData';

import Scene, { SceneHandle } from './scene/Scene';
import FloorPlan from './design/FloorPlan';
import Header from './design/layout/Header';
import Sidebar from './design/layout/Sidebar';
import RegistrationModal from './design/modals/RegistrationModal';
import StartModal from './design/modals/StartModal';
import CompleteModal from './design/modals/CompleteModal';
import OpDetailModal from './design/modals/OpDetailModal';
import HistoryModal from './design/modals/HistoryModal';

// ─── 모듈 레벨 상수 ──────────────────────────────────────────────────────────
const CANVAS_CAMERA = { position: [-6, 4.0, 0] as [number, number, number], fov: 30, near: 0.1, far: 1000 };
const CANVAS_DPR: [number, number] = [1, 2];
const CANVAS_STYLE: React.CSSProperties = { display: 'block', width: '100%', height: '100%', background: '#0a0a0a' };

const ROW_Z = [-4.9, 4.9] as const;
const START_X = 11;
const COL_WIDTH = 2.0;

const PANELS = (() => {
  const items = [];
  for (let col = 0; col < 12; col++) {
    items.push({
      id: `r1-c${col}`, upperId: col * 2 + 1, lowerId: col * 2 + 2,
      position: [START_X + col * COL_WIDTH, 2.5, ROW_Z[1]] as [number, number, number],
      rotation: [0, Math.PI, 0] as [number, number, number],
    });
  }
  for (let col = 0; col < 12; col++) {
    const upperId = col === 0 ? 47 : 47 - col * 2;
    const lowerId = col === 0 ? 47 : upperId + 1;
    items.push({
      id: `r0-c${col}`, upperId, lowerId,
      position: [START_X + col * COL_WIDTH, 2.5, ROW_Z[0]] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
    });
  }
  return items;
})();

const LOADING_FALLBACK = (
  <Html center>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 10, height: 10, borderRadius: '50%', background: '#10b981',
            animation: 'bounce 1s ease-in-out infinite', animationDelay: `${i * 0.15}s`,
          }} />
        ))}
      </div>
      <p style={{ color: '#10b981', fontFamily: 'monospace', fontWeight: 'bold', fontSize: 13, letterSpacing: 3, textTransform: 'uppercase' }}>
        패널 로딩 중...
      </p>
    </div>
  </Html>
);

const ThreeDView = React.memo(function ThreeDView({
  sceneRef,
  clearActivePanels,
  onCameraUpdate,
  isOperationActiveRef,
}: {
  sceneRef: React.RefObject<SceneHandle>;
  clearActivePanels: () => void;
  onCameraUpdate: (pos: { x: number; z: number; rotation: number }) => void;
  isOperationActiveRef: React.MutableRefObject<boolean>;
}) {
  return (
    <Canvas shadows dpr={CANVAS_DPR} className="w-full h-full"
      style={CANVAS_STYLE}
      camera={CANVAS_CAMERA}>
      <Suspense fallback={LOADING_FALLBACK}>
        <Scene
          ref={sceneRef}
          clearActivePanels={clearActivePanels}
          onCameraUpdate={onCameraUpdate}
          panels={PANELS}
          isOperationActiveRef={isOperationActiveRef}
        />
      </Suspense>
    </Canvas>
  );
}, (prev, next) =>
  prev.clearActivePanels === next.clearActivePanels &&
  prev.onCameraUpdate === next.onCameraUpdate &&
  prev.sceneRef === next.sceneRef &&
  prev.isOperationActiveRef === next.isOperationActiveRef
);

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [activeSideBtn, setActiveSideBtn] = useState('조작 등록');
  const [targetPanels, setTargetPanels] = useState<ActivePanel[]>([]);
  const [cameraPos, setCameraPos] = useState({ x: -6, z: 0, rotation: 0 });
  const [showRegistration, setShowRegistration] = useState(false);
  const [showStart, setShowStart] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [statusOps, setStatusOps] = useState<Operation[]>([]);
  const [statusLoading, setStatusLoading] = useState(true);
  const [selectedOp, setSelectedOp] = useState<Operation | null>(null);

  const isOperationActiveRef = useRef(false);
  const sceneRef = useRef<SceneHandle>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const lastFetchedRef = useRef('[]');

  const clearTargetPanels = useCallback(async () => {
    try { await fetch('/api/active-panels', { method: 'DELETE' }); } catch {}
    lastFetchedRef.current = '[]';
    setTargetPanels([]);
  }, []);

  useEffect(() => {
    const el = canvasContainerRef.current;
    if (!el) return;
    const isolatedRoot = createRoot(el);
    isolatedRoot.render(
      <ThreeDView
        sceneRef={sceneRef}
        clearActivePanels={clearTargetPanels}
        onCameraUpdate={setCameraPos}
        isOperationActiveRef={isOperationActiveRef}
      />
    );
    return () => { isolatedRoot.unmount(); };
  }, []);

  const reloadStatusOps = useCallback(() => {
    fetch('/api/operations?status=진행중').then(r => r.json())
      .then(d => setStatusOps(d.operations ?? [])).catch(() => {});
  }, []);

  useEffect(() => {
    fetch('/api/operations?status=진행중').then(r => r.json())
      .then(d => { setStatusOps(d.operations ?? []); setStatusLoading(false); })
      .catch(() => setStatusLoading(false));
  }, []);

  useEffect(() => {
    const poll = async () => {
      try {
        const data = await fetch('/api/active-panels').then(r => r.json());
        if (Array.isArray(data.panels)) {
          const s = JSON.stringify(data.panels);
          if (s !== lastFetchedRef.current) {
            lastFetchedRef.current = s;
            setTargetPanels(data.panels);
            if (data.panels.length > 0) {
              sceneRef.current?.startAnimation(data.panels.map((p: any) => p.id));
            }
          }
        }
      } catch {}
    };
    const id = setInterval(poll, 1000);
    return () => clearInterval(id);
  }, []);

  const targetSubIds = useMemo(() => targetPanels.map(p => p.id), [targetPanels]);

  const handleRegister = useCallback(() => {
    sceneRef.current?.cancelAnimation();
    setShowRegistration(true);
  }, []);
  const handleStart = useCallback(() => {
    sceneRef.current?.cancelAnimation();
    setShowStart(true);
  }, []);
  const handleComplete = useCallback(() => {
    sceneRef.current?.cancelAnimation();
    setShowComplete(true);
  }, []);
  const handleHistory = useCallback(() => {
    sceneRef.current?.cancelAnimation();
    setShowHistory(true);
  }, []);

  return (
    <div className="w-full h-screen bg-white overflow-hidden relative font-sans select-none flex flex-row">
      
      {/* ─── 왼쪽 메인 사이드바 (mainoutlet.jpg 스타일) ─── */}
      <div className="w-64 h-full bg-white border-r border-gray-100 flex flex-col z-40">
        {/* 로고 영역 */}
        <div className="px-6 py-10">
          <img src="/logo.png" alt="KOEN" className="h-10 object-contain" />
        </div>

        {/* 메인 메뉴 */}
        <nav className="flex-1 px-4 flex flex-col gap-2">
          {[
            { id: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard, active: true },
            { id: 'overview', label: 'UNIT OVERVIEW', icon: Box },
            { id: 'alarm', label: 'ALARM & EVENT', icon: AlertCircle },
            { id: 'history', label: 'HISTORY', icon: History },
            { id: 'settings', label: 'SETTINGS', icon: Settings },
          ].map((item) => (
            <button
              key={item.id}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl font-black text-xs tracking-widest transition-all ${
                item.active 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
            >
              <item.icon size={20} strokeWidth={item.active ? 2.5 : 2} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* 서포트 및 푸터 */}
        <div className="px-6 py-8 flex flex-col gap-8">
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-blue-600">
              <Headphones size={18} />
              <span className="text-[11px] font-black tracking-tighter uppercase">24/7 Support</span>
            </div>
            <p className="text-[11px] font-bold text-slate-400 leading-tight">Control Center<br/>055-123-4567</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[10px] font-bold text-slate-300">© 2026 KOEN</p>
            <p className="text-[10px] font-medium text-slate-300">All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* ─── 메인 컨텐츠 영역 ─── */}
      <div className="flex-1 h-full flex flex-col bg-slate-50">
        
        {showRegistration && <RegistrationModal onClose={() => { setShowRegistration(false); reloadStatusOps(); }} />}
        {showStart && <StartModal onClose={confirmed => { setShowStart(false); if (confirmed) isOperationActiveRef.current = true; }} />}
        {showComplete && <CompleteModal onClose={() => setShowComplete(false)} onDone={reloadStatusOps} />}
        {showHistory && <HistoryModal onClose={() => setShowHistory(false)} />}
        {selectedOp && <OpDetailModal op={selectedOp} onClose={() => setSelectedOp(null)} />}

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* 2D 도면 */}
          <div className="w-full md:w-[32%] h-[40%] md:h-full border-b md:border-b-0 md:border-r border-gray-100 z-30">
            <FloorPlan cameraPos={cameraPos} panels={PANELS} targetSubIds={targetSubIds} targetPanels={targetPanels} />
          </div>

          {/* 3D + 오른쪽 사이드바 */}
          <div className="w-full md:w-[68%] h-[60%] md:h-full flex flex-row pr-0">
            <div className="relative flex-1 h-full bg-slate-50 flex flex-col p-4 gap-4">
              <Header targetPanels={targetPanels} statusOps={statusOps} />

              <div className="relative flex-1 rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm min-h-0">
                {/* 패널 알람 오버레이 */}
                <div className={`absolute top-4 left-4 right-1/2 z-30 flex flex-col gap-1 pointer-events-none ${targetPanels.length === 0 ? 'hidden' : ''}`}>
                  {targetPanels.map(p => {
                    const info = PANEL_DATA[p.id];
                    return (
                      <div key={p.id} className="flex items-center gap-3 bg-white/95 backdrop-blur shadow-md border border-red-100 px-3 py-2 rounded-xl">
                        <span className="relative flex h-2 w-2 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                        </span>
                        <span className="text-red-600 font-mono font-black text-xs tracking-wide shrink-0">{info?.unitId ?? String(p.id).padStart(2, '0')}</span>
                        <div className="w-px h-3 bg-gray-200 shrink-0" />
                        <span className="text-slate-700 text-xs font-bold truncate flex-1">{info?.name ?? p.description}</span>
                        {p.status && (
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg shrink-0 ${p.status.toUpperCase() === 'ON' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            {p.status.toUpperCase()}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                {/* 3D View 컨테이너 */}
                <div ref={canvasContainerRef} className="absolute inset-0" />
              </div>

              <div className="shrink-0 flex items-center justify-end px-5 py-2.5 rounded-2xl border border-gray-100 bg-white shadow-sm">
                <span className="text-[11px] font-black tracking-[0.2em] text-slate-300 uppercase">Yeongdong Power Plant Unit 1 · VCD Monitoring System</span>
              </div>
            </div>

            <Sidebar
              statusOps={statusOps} statusLoading={statusLoading} onSelectOp={setSelectedOp}
              onRegister={handleRegister} onStart={handleStart}
              onComplete={handleComplete} onHistory={handleHistory}
              activeSideBtn={activeSideBtn} setActiveSideBtn={setActiveSideBtn}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
