import React, { useState, useMemo, useEffect, Suspense, useCallback, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas } from '@react-three/fiber';
import { Html } from '@react-three/drei';

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

// ─── 모듈 레벨 상수: 렌더링마다 새 객체 생성 방지 ───────────────────────────
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

// ─── 완전 격리된 3D Canvas 래퍼 ──────────────────────────────────────────────
// 별도 React 루트에서 마운트 → App 리렌더링이 Canvas에 절대 전파 불가
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

  // clearTargetPanels을 먼저 정의 — 격리 루트 effect가 참조하기 때문
  const clearTargetPanels = useCallback(async () => {
    try { await fetch('/api/active-panels', { method: 'DELETE' }); } catch {}
    lastFetchedRef.current = '[]';
    setTargetPanels([]);
  }, []);

  // 별도 React 루트에 Canvas 마운트 — App 리렌더링이 3D 파트에 절대 전파되지 않음
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
  // 의존성 없음 — 마운트 시 한 번만 실행, 모든 prop이 안정적 ref/callback
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div className="w-full h-screen bg-slate-950 overflow-hidden relative font-sans select-none flex flex-col md:flex-row">
      {showRegistration && <RegistrationModal onClose={() => { setShowRegistration(false); reloadStatusOps(); }} />}
      {showStart && <StartModal onClose={confirmed => { setShowStart(false); if (confirmed) isOperationActiveRef.current = true; }} />}
      {showComplete && <CompleteModal onClose={() => setShowComplete(false)} onDone={reloadStatusOps} />}
      {showHistory && <HistoryModal onClose={() => setShowHistory(false)} />}
      {selectedOp && <OpDetailModal op={selectedOp} onClose={() => setSelectedOp(null)} />}

      {/* 2D 도면 */}
      <div className="w-full md:w-[30%] h-[40%] md:h-full border-b md:border-b-0 md:border-r border-slate-800 z-30">
        <FloorPlan cameraPos={cameraPos} panels={PANELS} targetSubIds={targetSubIds} targetPanels={targetPanels} />
      </div>

      {/* 3D + 사이드바 */}
      <div className="w-full md:w-[70%] h-[60%] md:h-full flex flex-row pr-6">
        <div className="relative flex-1 h-full bg-[#080c14] flex flex-col p-2.5 gap-2">
          <Header targetPanels={targetPanels} statusOps={statusOps} />

          <div className="relative flex-1 rounded-xl overflow-hidden border-2 border-sky-500/50 shadow-[0_0_0_1px_rgba(14,165,233,0.15),0_0_60px_rgba(14,165,233,0.18),inset_0_0_30px_rgba(14,165,233,0.04)] min-h-0">

            {/* 패널 알람 오버레이 */}
            <div className={`absolute top-3 left-3 right-1/2 z-30 flex flex-col gap-0.5 pointer-events-none ${targetPanels.length === 0 ? 'hidden' : ''}`}>
              {targetPanels.map(p => {
                const info = PANEL_DATA[p.id];
                return (
                  <div key={p.id} className="flex items-center gap-2 bg-red-950/90 backdrop-blur-sm border border-red-800/60 px-2.5 py-1 rounded-md shadow-lg">
                    <span className="relative flex h-1.5 w-1.5 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
                    </span>
                    <span className="text-red-300 font-mono font-bold text-[11px] tracking-wide shrink-0">{info?.unitId ?? String(p.id).padStart(2, '0')}</span>
                    <span className="w-px h-3 bg-red-800 shrink-0" />
                    <span className="text-slate-200 text-[11px] truncate flex-1">{info?.name ?? p.description}</span>
                    {p.status && (
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${p.status.toUpperCase() === 'ON' ? 'bg-emerald-950 text-emerald-400' : 'bg-red-900 text-red-300'}`}>
                        {p.status.toUpperCase()}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 별도 React 루트 컨테이너 — App 리렌더링과 완전 격리 */}
            <div ref={canvasContainerRef} className="absolute inset-0" />
          </div>

          <div className="shrink-0 flex items-center justify-end px-4 py-1.5 rounded-xl border border-sky-900/40 bg-slate-900/60">
            <span className="text-[10px] font-bold tracking-[0.12em] text-slate-500">영동 1호기 고압차단기</span>
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
  );
}
