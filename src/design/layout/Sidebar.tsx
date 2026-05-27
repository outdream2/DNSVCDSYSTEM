import React from 'react';
import { Operation } from '../../data/types';
import StatusList from './StatusList';

const SIDE_BUTTONS = [
  { label: '조작 등록', sub: 'REGISTER', action: 'registration' },
  { label: '조작등록내역', sub: 'STATUS', action: 'status' },
  { label: '조작 시작', sub: 'START', action: 'start' },
  { label: '조작 완료', sub: 'COMPLETE', action: 'complete' },
  { label: '이력 조회', sub: 'HISTORY', action: 'history' },
];

function Sidebar({
  statusOps, statusLoading, onSelectOp,
  onRegister, onStart, onComplete, onHistory,
  activeSideBtn, setActiveSideBtn,
}: {
  statusOps: Operation[];
  statusLoading: boolean;
  onSelectOp: (op: Operation) => void;
  onRegister: () => void;
  onStart: () => void;
  onComplete: () => void;
  onHistory: () => void;
  activeSideBtn: string;
  setActiveSideBtn: (label: string) => void;
}) {
  return (
    <div className="w-72 h-full flex flex-col bg-white border-l border-gray-200 shrink-0 overflow-hidden">

      {/* 통신정보 섹션 */}
      <div className="px-3 pt-3 pb-2 shrink-0">
        <div className="rounded-xl bg-gray-50 border border-gray-200 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-1.5 border-b border-gray-100 bg-white">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><circle cx="12" cy="20" r="1" /></svg>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">통신정보</span>
          </div>
          <div className="flex flex-col divide-y divide-gray-100">
            <div className="flex items-center gap-2 px-3 py-2">
              <div className="relative shrink-0">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-50" />
              </div>
              <span className="text-[11px] text-gray-600 font-medium">GENi 연동</span>
              <span className="ml-auto text-[9px] font-bold text-emerald-600">ON</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2">
              <div className="relative shrink-0">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-50" />
              </div>
              <span className="text-[11px] text-gray-600 font-medium">키보관함 연동</span>
              <span className="ml-auto text-[9px] font-bold text-blue-600">ON</span>
            </div>
          </div>
        </div>
      </div>

      {/* 상단 버튼: 조작 등록 + 조작등록내역 */}
      <div className="flex flex-col gap-2 pl-3 pr-6 pb-2 shrink-0">
        {SIDE_BUTTONS.filter(b => b.action === 'registration' || b.action === 'status').map(({ label, sub, action }) => {
          const isActive = activeSideBtn === label;
          return (
            <button key={label}
              onClick={() => { setActiveSideBtn(label); if (action === 'registration') onRegister(); }}
              className={`w-full rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all duration-200 border ${
                isActive
                  ? 'bg-blue-600 hover:bg-blue-700 border-blue-600 shadow-md shadow-blue-100 py-4'
                  : action === 'status'
                    ? 'bg-white hover:bg-blue-50 border-blue-400 py-3.5'
                    : 'bg-white hover:bg-gray-50 border-gray-200 py-3.5'
              }`}
            >
              <span className={`text-[13px] font-bold tracking-tight leading-none ${isActive ? 'text-white' : 'text-gray-700'}`}>{label}</span>
              <span className={`text-[9px] font-semibold tracking-[0.2em] uppercase leading-none ${isActive ? 'text-blue-100' : 'text-gray-400'}`}>{sub}</span>
            </button>
          );
        })}
      </div>

      {/* 조작 내역 리스트 */}
      <StatusList statusOps={statusOps} statusLoading={statusLoading} onSelectOp={onSelectOp} />

      {/* 하단 버튼: 조작 시작 + 조작 완료 + 이력 조회 */}
      <div className="flex flex-col gap-2 pl-3 pr-6 pt-2 pb-3 shrink-0">
        {SIDE_BUTTONS.filter(b => b.action !== 'registration' && b.action !== 'status').map(({ label, sub, action }) => {
          const isActive = activeSideBtn === label;
          return (
            <button key={label}
              onClick={() => {
                setActiveSideBtn(label);
                if (action === 'start') onStart();
                if (action === 'complete') onComplete();
                if (action === 'history') onHistory();
              }}
              className={`w-full rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all duration-200 border ${
                isActive
                  ? 'bg-blue-600 hover:bg-blue-700 border-blue-600 shadow-md shadow-blue-100 py-4'
                  : 'bg-white hover:bg-gray-50 border-gray-200 py-3.5'
              }`}
            >
              <span className={`text-[13px] font-bold tracking-tight leading-none ${isActive ? 'text-white' : 'text-gray-700'}`}>{label}</span>
              <span className={`text-[9px] font-semibold tracking-[0.2em] uppercase leading-none ${isActive ? 'text-blue-100' : 'text-gray-400'}`}>{sub}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default Sidebar;
