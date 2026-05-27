import React from 'react';
import { Operation } from '../../data/types';
import { getOperations } from '../../api/operationApi';

function StatusModal({ onClose }: { onClose: () => void }) {
  const [ops, setOps] = React.useState<Operation[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [tab, setTab] = React.useState<'전체' | '진행중' | '완료' | '실패'>('전체');

  React.useEffect(() => {
    getOperations().then(ops => { setOps(ops); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = tab === '전체' ? ops : ops.filter(o => o.status === tab);

  const TAB_COUNTS = {
    전체: ops.length,
    진행중: ops.filter(o => o.status === '진행중').length,
    완료: ops.filter(o => o.status === '완료').length,
    실패: ops.filter(o => o.status === '실패').length,
  };

  const statusStyle = (s: string) => {
    if (s === '완료') return { dot: 'bg-emerald-400', badge: 'bg-emerald-900/50 text-emerald-300 border-emerald-700/50' };
    if (s === '진행중') return { dot: 'bg-sky-400 animate-pulse', badge: 'bg-sky-900/50 text-sky-300 border-sky-700/50' };
    return { dot: 'bg-red-400', badge: 'bg-red-900/50 text-red-300 border-red-700/50' };
  };
  const typeColor = (t: string) => t === 'KEY CLOSED' ? 'text-slate-400' : t === 'KEY OPEN' ? 'text-emerald-400' : 'text-red-500 font-bold';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#0f1623] border border-slate-700 rounded-2xl shadow-2xl w-full max-w-xl mx-4 flex flex-col max-h-[85vh] overflow-hidden">

        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900/70 border-b border-slate-700/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7dd3fc" strokeWidth="2"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
            </div>
            <div><p className="text-white font-bold text-base">조작 내역</p><p className="text-slate-500 text-[10px] tracking-widest uppercase">STATUS</p></div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-red-900/60 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        {/* 탭 */}
        <div className="flex gap-1 px-4 py-3 border-b border-slate-800 shrink-0">
          {(['전체', '진행중', '완료', '실패'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${tab === t ? 'bg-[#6B5EF8] text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
              {t}
              <span className={`text-[10px] font-mono px-1 rounded ${tab === t ? 'bg-white/20' : 'bg-slate-700'}`}>{TAB_COUNTS[t]}</span>
            </button>
          ))}
        </div>

        {/* 리스트 */}
        <div className="overflow-y-auto flex-1 min-h-0 p-3 flex flex-col gap-2">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-500 text-sm">로딩 중...</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-600">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              <span className="text-sm">내역 없음</span>
            </div>
          ) : filtered.map(op => {
            const st = statusStyle(op.status);
            return (
              <div key={op.id} className="flex items-start gap-3 p-3.5 bg-slate-800/50 hover:bg-slate-800/80 border border-slate-700/50 rounded-xl transition-colors">
                {/* 상태 점 */}
                <div className="flex flex-col items-center gap-1 pt-0.5 shrink-0">
                  <div className={`w-2.5 h-2.5 rounded-full ${st.dot}`} />
                </div>

                {/* 내용 */}
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-indigo-300 font-mono font-bold text-xs">{op.unitId}</span>
                    <span className="text-slate-300 text-xs truncate">{op.panelName}</span>
                    <span className={`text-xs font-bold ${typeColor(op.opType)}`}>[{op.opType}]</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    <span>👤 {op.operator}</span>
                    {op.department && <span>· {op.department}</span>}
                    <span>· {op.purpose}</span>
                  </div>
                  <div className="text-[10px] text-slate-600 font-mono">{op.operatedAt.replace('T', ' ').slice(0, 16)}</div>
                </div>

                {/* 상태 배지 */}
                <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${st.badge}`}>{op.status}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default StatusModal;
