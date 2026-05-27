import React from 'react';
import { Operation } from '../../data/types';
import { TEAM_DATA } from '../../data/staffData';

function CompleteModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [ops, setOps] = React.useState<Operation[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [checkedIds, setCheckedIds] = React.useState<number[]>([]);
  const [submitting, setSubmitting] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [team, setTeam] = React.useState('');
  const [supervisor, setSupervisor] = React.useState('');
  const [worker, setWorker] = React.useState('');
  const teamInfo = team ? TEAM_DATA[team] : null;
  const confirmed = team && supervisor && worker && checkedIds.length > 0;
  React.useEffect(() => { setSupervisor(''); setWorker(''); }, [team]);
  const cSelectCls = "w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors";

  React.useEffect(() => {
    fetch('/api/operations?status=진행중')
      .then(r => r.json())
      .then(d => { setOps(d.operations ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const toggle = (id: number) => setCheckedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll = () => setCheckedIds(checkedIds.length === ops.length ? [] : ops.map(o => o.id));

  const handleComplete = async () => {
    if (checkedIds.length === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/operations/complete', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: checkedIds }),
      });
      if (!res.ok) throw new Error(`서버 오류: ${res.status}`);
      setDone(true);
      setTimeout(() => { onDone(); onClose(); }, 1200);
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#0f1623] border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">

        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900/70 border-b border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <div><p className="text-white font-bold text-base">조작 완료</p><p className="text-slate-500 text-[10px] tracking-widest uppercase">COMPLETE</p></div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-red-900/60 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <p className="text-emerald-400 font-bold">{checkedIds.length}건 완료 처리됨</p>
          </div>
        ) : (
          <div className="p-5 flex flex-col gap-4">
            {/* 리스트 */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">진행중 목록</label>
                <button onClick={toggleAll} className="text-[10px] text-sky-400 hover:text-sky-300 font-bold transition-colors">
                  {checkedIds.length === ops.length && ops.length > 0 ? '전체 해제' : '전체 선택'}
                </button>
              </div>
              <div className="bg-slate-800/60 border border-slate-600/60 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                {loading ? (
                  <div className="px-4 py-4 text-slate-500 text-xs text-center">로딩 중...</div>
                ) : ops.length === 0 ? (
                  <div className="px-4 py-4 text-slate-500 text-xs text-center">진행중인 작업 없음</div>
                ) : ops.map(op => {
                  const checked = checkedIds.includes(op.id);
                  return (
                    <label key={op.id} className={`flex items-center gap-3 px-3 py-3 border-b border-slate-700/30 last:border-0 cursor-pointer transition-colors ${checked ? 'bg-emerald-950/30' : 'hover:bg-slate-700/30'}`}>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${checked ? 'bg-emerald-600 border-emerald-500' : 'bg-slate-700 border-slate-600'}`}>
                        {checked && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
                      </div>
                      <input type="checkbox" className="hidden" checked={checked} onChange={() => toggle(op.id)} />
                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-indigo-300 font-mono text-xs font-bold shrink-0">{op.unitId}</span>
                          <span className="text-slate-300 text-xs truncate">{op.panelName}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] font-bold ${op.opType === 'KEY CLOSED' ? 'text-slate-400' : op.opType === 'KEY OPEN' ? 'text-emerald-400' : 'text-red-500'}`}>{op.opType}</span>
                          <span className="text-slate-600 text-[9px]">·</span>
                          <span className="text-slate-500 text-[9px]">{op.operator}</span>
                        </div>
                      </div>
                      <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse shrink-0" />
                    </label>
                  );
                })}
              </div>
              <div className="text-right text-[10px] text-slate-500">{checkedIds.length}건 선택</div>
            </div>

            {/* 팀 선택 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">팀 선택 <span className="text-red-400">*</span></label>
              <select value={team} onChange={e => setTeam(e.target.value)} className={cSelectCls}>
                <option value="">— 팀을 선택하세요 —</option>
                {Object.keys(TEAM_DATA).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* 책임자 / 작업자 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">책임자 <span className="text-red-400">*</span></label>
                <select value={supervisor} onChange={e => setSupervisor(e.target.value)} disabled={!team} className={`${cSelectCls} disabled:opacity-40 disabled:cursor-not-allowed`}>
                  <option value="">— 선택 —</option>
                  {teamInfo?.supervisors.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">작업자 <span className="text-red-400">*</span></label>
                <select value={worker} onChange={e => setWorker(e.target.value)} disabled={!team} className={`${cSelectCls} disabled:opacity-40 disabled:cursor-not-allowed`}>
                  <option value="">— 선택 —</option>
                  {teamInfo?.workers.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
            </div>

            {/* 확인 정보 */}
            {confirmed && (
              <div className="flex flex-col gap-0 bg-slate-800/60 border border-emerald-700/30 rounded-xl overflow-hidden">
                <div className="px-4 py-2 bg-emerald-900/20 border-b border-emerald-700/30">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">확인 정보</span>
                </div>
                {[
                  { label: '팀', value: team },
                  { label: '책임자', value: supervisor },
                  { label: '작업자', value: worker },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center gap-3 px-4 py-2 border-b border-slate-700/40">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider w-14 shrink-0">{label}</span>
                    <span className="text-sm text-slate-200">{value}</span>
                  </div>
                ))}
                <div className="flex items-start gap-3 px-4 py-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider w-14 shrink-0 pt-0.5">대상</span>
                  <div className="flex flex-col gap-0.5 flex-1">
                    {checkedIds.map(id => {
                      const op = ops.find(o => o.id === id);
                      return op ? (
                        <div key={id} className="flex items-center gap-2">
                          <span className="text-indigo-300 font-mono text-xs font-bold">{op.unitId}</span>
                          <span className="text-slate-400 text-xs truncate">{op.panelName}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
            )}

            <button onClick={handleComplete} disabled={submitting || !confirmed}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
              {submitting ? '처리 중...' : `완료 처리 (${checkedIds.length}건)`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CompleteModal;
