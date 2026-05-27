import React from 'react';
import { Operation } from '../../data/types';

function StatusList({ statusOps, statusLoading, onSelectOp }: { statusOps: Operation[]; statusLoading: boolean; onSelectOp: (op: Operation) => void }) {
  return (
    <div className="mx-3 flex flex-col rounded-xl border-2 border-sky-500/60 shadow-md shadow-sky-900/20 mb-2 shrink-0" style={{ maxHeight: '196px', overflow: 'hidden' }}>
      {/* 섹션 헤더 */}
      <div className="flex items-center justify-between px-3 py-2 bg-sky-900/30 border-b border-sky-700/40 shrink-0">
        <div className="flex items-center gap-1.5">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">조작 등록 내역</span>
        </div>
        <span className="text-[9px] font-mono text-slate-500 bg-slate-700/50 px-1.5 py-0.5 rounded-full">{statusOps.length}건</span>
      </div>

      {/* 컬럼 헤더 */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 border-b border-slate-700/40 shrink-0">
        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider w-16 shrink-0">기기번호</span>
        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider flex-1">키상태</span>
        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider w-12 shrink-0 text-center">작업상태</span>
        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider w-10 shrink-0 text-center">상세</span>
      </div>

      {/* 스크롤 목록 */}
      <div className="overflow-y-auto flex-1 min-h-0 divide-y divide-slate-700/30">
        {statusLoading ? (
          <div className="text-center text-slate-600 text-xs py-8">로딩 중...</div>
        ) : statusOps.length === 0 ? (
          <div className="text-center text-slate-600 text-xs py-8">내역 없음</div>
        ) : [...statusOps].sort((a, b) => b.operatedAt.localeCompare(a.operatedAt)).map((op, i) => {
          const stBadge = op.status === '완료'
            ? 'bg-emerald-900/60 text-emerald-300'
            : op.status === '진행중'
              ? 'bg-sky-900/60 text-sky-300'
              : 'bg-red-900/60 text-red-300';
          const typeCls = op.opType === 'KEY CLOSED' ? 'text-slate-400' : op.opType === 'KEY OPEN' ? 'text-emerald-400' : 'text-red-500 font-bold';
          return (
            <div key={op.id} className={`flex items-center gap-2 px-3 py-2 hover:bg-slate-800/40 transition-colors ${i % 2 === 1 ? 'bg-slate-800/20' : ''}`}>
              <span className="text-indigo-300 font-mono text-[11px] font-bold w-16 shrink-0 truncate">{op.unitId}</span>
              <span className={`text-[9px] font-bold flex-1 truncate ${typeCls}`}>{op.opType}</span>
              <span className={`text-[9px] font-bold px-1 py-0.5 rounded-full w-12 shrink-0 text-center ${stBadge}`}>{op.status}</span>
              <button onClick={() => onSelectOp(op)}
                className="text-[9px] font-bold text-violet-400 hover:text-white px-1 py-0.5 rounded bg-violet-950/50 border border-violet-800/50 hover:bg-violet-700 hover:border-violet-500 transition-all w-10 shrink-0 text-center">
                자세히
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StatusList;
