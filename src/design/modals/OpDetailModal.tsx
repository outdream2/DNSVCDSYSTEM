import React from 'react';
import { Operation } from '../../data/types';

function OpDetailModal({ op, onClose }: { op: Operation; onClose: () => void }) {
  const stBadge = op.status === '완료' ? 'bg-emerald-900/60 text-emerald-300 border-emerald-700/50' : op.status === '진행중' ? 'bg-sky-900/60 text-sky-300 border-sky-700/50' : 'bg-red-900/60 text-red-300 border-red-700/50';
  const typeCls = op.opType === 'KEY CLOSED' ? 'text-slate-300' : op.opType === 'KEY OPEN' ? 'text-emerald-400 font-bold' : 'text-red-500 font-bold';

  const SectionHeader = ({ title }: { title: string }) => (
    <div className="px-4 py-2 bg-slate-800/50 border-b border-slate-700/40">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</span>
    </div>
  );
  const Row = ({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) => (
    <div className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-800/40 last:border-0">
      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider w-20 shrink-0">{label}</span>
      <span className={`text-sm ${valueClass ?? 'text-slate-200'}`}>{value || '—'}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#0f1623] border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">

        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900/70 border-b border-slate-700/60">
          <div className="flex items-center gap-3">
            <span className="text-white font-bold text-base">조작 상세</span>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${stBadge}`}>{op.status}</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-red-900/60 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        <div className="flex flex-col">
          {/* 작업정보 */}
          <SectionHeader title="작업정보" />
          <Row label="기기번호" value={op.unitId} valueClass="text-indigo-300 font-mono font-bold" />
          <Row label="기기명" value={op.panelName} />
          <Row label="조작자" value={op.operator} />
          <Row label="부서" value={op.department} />
          <Row label="사유" value={op.purpose} />
          <Row label="일시" value={op.operatedAt.replace('T', ' ').slice(0, 16)} valueClass="text-slate-300 font-mono" />

          {/* 키정보 */}
          <SectionHeader title="키정보" />
          <Row label="키상태" value={op.opType} valueClass={typeCls} />
          <Row label="작업상태" value={op.status} />
          {op.notes && <Row label="비고" value={op.notes} valueClass="text-slate-400" />}
        </div>

        <div className="px-6 pb-5 pt-3">
          <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm font-bold transition-all">닫기</button>
        </div>
      </div>
    </div>
  );
}

export default OpDetailModal;
