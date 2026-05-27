import React from 'react';
import { Operation } from '../../data/types';
import { TEAM_DATA } from '../../data/staffData';
import { getOperations, completeOperations } from '../../api/operationApi';

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
  const cSelectCls = "w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-emerald-500 transition-colors shadow-sm";

  React.useEffect(() => {
    getOperations({ status: '진행중' })
      .then(ops => { setOps(ops); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const toggle = (id: number) => setCheckedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll = () => setCheckedIds(checkedIds.length === ops.length ? [] : ops.map(o => o.id));

  const handleComplete = async () => {
    if (checkedIds.length === 0) return;
    setSubmitting(true);
    try {
      await completeOperations(checkedIds);
      setDone(true);
      setTimeout(() => { onDone(); onClose(); }, 1200);
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white border border-gray-100 rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in duration-200">

        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
          <div className="flex items-center gap-3 text-left">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <div><p className="text-slate-800 font-bold text-base leading-none">조작 완료</p><p className="text-emerald-500 text-[10px] font-black tracking-widest uppercase mt-1">COMPLETE</p></div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-red-50 border border-gray-200 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center border-2 border-emerald-500">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <p className="text-emerald-600 font-bold text-lg">{checkedIds.length}건 완료 처리됨</p>
          </div>
        ) : (
          <div className="p-5 flex flex-col gap-4 text-left">
            {/* 리스트 */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between px-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">진행중 목록</label>
                <button onClick={toggleAll} className="text-[10px] text-blue-500 hover:text-blue-600 font-black transition-colors uppercase tracking-wider">
                  {checkedIds.length === ops.length && ops.length > 0 ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="bg-slate-50 border border-gray-100 rounded-xl overflow-hidden max-h-60 overflow-y-auto shadow-inner">
                {loading ? (
                  <div className="px-4 py-8 text-slate-400 text-[11px] font-bold text-center uppercase tracking-widest">Loading...</div>
                ) : ops.length === 0 ? (
                  <div className="px-4 py-8 text-slate-400 text-[11px] font-bold text-center uppercase tracking-widest">No active ops</div>
                ) : ops.map(op => {
                  const checked = checkedIds.includes(op.id);
                  return (
                    <label key={op.id} className={`flex items-center gap-3 px-3 py-3 border-b border-gray-100 last:border-0 cursor-pointer transition-colors ${checked ? 'bg-emerald-50/50' : 'hover:bg-white'}`}>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${checked ? 'bg-emerald-600 border-emerald-600' : 'bg-white border-gray-300'}`}>
                        {checked && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><polyline points="20 6 9 17 4 12" /></svg>}
                      </div>
                      <input type="checkbox" className="hidden" checked={checked} onChange={() => toggle(op.id)} />
                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-blue-600 font-mono text-xs font-black shrink-0">{op.unitId}</span>
                          <span className="text-slate-600 text-xs truncate font-medium">{op.panelName}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] font-bold uppercase ${op.opType === 'KEY CLOSED' ? 'text-slate-400' : op.opType === 'KEY OPEN' ? 'text-emerald-500' : 'text-red-500'}`}>{op.opType}</span>
                          <span className="text-slate-300 text-[9px]">•</span>
                          <span className="text-slate-400 text-[9px] font-bold uppercase">{op.operator}</span>
                        </div>
                      </div>
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shrink-0" />
                    </label>
                  );
                })}
              </div>
              <div className="text-right px-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{checkedIds.length} SELECTED</span>
              </div>
            </div>

            {/* 팀 선택 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">팀 선택 <span className="text-red-500">*</span></label>
              <select value={team} onChange={e => setTeam(e.target.value)} className={cSelectCls}>
                <option value="">— 팀을 선택하세요 —</option>
                {Object.keys(TEAM_DATA).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* 책임자 / 작업자 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">책임자 <span className="text-red-500">*</span></label>
                <select value={supervisor} onChange={e => setSupervisor(e.target.value)} disabled={!team} className={`${cSelectCls} disabled:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed`}>
                  <option value="">— 선택 —</option>
                  {teamInfo?.supervisors.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">작업자 <span className="text-red-500">*</span></label>
                <select value={worker} onChange={e => setWorker(e.target.value)} disabled={!team} className={`${cSelectCls} disabled:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed`}>
                  <option value="">— 선택 —</option>
                  {teamInfo?.workers.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
            </div>

            {/* 확인 정보 */}
            {confirmed && (
              <div className="flex flex-col gap-0 bg-white border border-emerald-100 rounded-xl overflow-hidden shadow-sm animate-in slide-in-from-top-1 duration-200">
                <div className="px-4 py-2 bg-emerald-50/50 border-b border-emerald-100">
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Execution Details</span>
                </div>
                {[
                  { label: '팀', value: team },
                  { label: '책임자', value: supervisor },
                  { label: '작업자', value: worker },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center gap-3 px-4 py-2 border-b border-gray-50 last:border-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest w-16 shrink-0">{label}</span>
                    <span className="text-sm text-slate-800 font-bold leading-none">{value}</span>
                  </div>
                ))}
              </div>
            )}

            <button onClick={handleComplete} disabled={submitting || !confirmed}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-100 disabled:text-slate-400 text-white font-black text-sm tracking-widest transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 active:scale-[0.98]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
              {submitting ? 'PROCESSING...' : `완료 처리 (${checkedIds.length}건)`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CompleteModal;
