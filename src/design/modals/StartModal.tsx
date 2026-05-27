import React from 'react';
import { Operation } from '../../data/types';
import { TEAM_DATA } from '../../data/staffData';
import { getOperations } from '../../api/operationApi';
import { setActivePanels } from '../../api/panelApi';

function StartModal({ onClose }: { onClose: (confirmed?: boolean) => void }) {
  const [team, setTeam] = React.useState('');
  const [supervisor, setSupervisor] = React.useState('');
  const [worker, setWorker] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);
  const [regOps, setRegOps] = React.useState<Operation[]>([]);
  const [checkedOpIds, setCheckedOpIds] = React.useState<number[]>([]);
  const toggleOp = (id: number) => setCheckedOpIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const teamInfo = team ? TEAM_DATA[team] : null;
  const confirmed = team && supervisor && worker;

  // 조작등록에서 등록된 차단기 불러오기
  React.useEffect(() => {
    getOperations({ status: '진행중' }).then(setRegOps).catch(() => {});
  }, []);

  React.useEffect(() => {
    setSupervisor('');
    setWorker('');
  }, [team]);

  const [actionType, setActionType] = React.useState<'start' | 'complete' | null>(null);

  const handleAction = (type: 'start' | 'complete') => {
    setActionType(type);
    setSubmitted(true);
    setTimeout(() => {
      onClose(type === 'start');
      if (type === 'start' && checkedOpIds.length > 0) {
        const panels = checkedOpIds.map(id => {
          const op = regOps.find(o => o.id === id);
          return op ? { id: op.panelId, status: 'ON', description: op.unitId } : null;
        }).filter(Boolean);
        setActivePanels(panels as any).catch(() => {});
      }
    }, 1400);
  };

  const selectCls = "w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#0f1623] border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">

        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900/70 border-b border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7dd3fc" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
            </div>
            <div><p className="text-white font-bold text-base">조작 시작</p><p className="text-slate-500 text-[10px] tracking-widest uppercase">START</p></div>
          </div>
          <button onClick={() => onClose()} className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-red-900/60 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 ${actionType === 'complete' ? 'bg-emerald-500/20 border-emerald-500' : 'bg-sky-500/20 border-sky-500'}`}>
              {actionType === 'complete'
                ? <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                : <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3" /></svg>}
            </div>
            <p className={`font-bold ${actionType === 'complete' ? 'text-emerald-400' : 'text-sky-400'}`}>
              {actionType === 'complete' ? '작업 완료 처리됨' : '작업 시작됨'}
            </p>
          </div>
        ) : (
          <div className="p-5 flex flex-col gap-4">

            {/* 조작 내역 — 체크리스트 (최상단) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">조작 내역</label>
                <span className="text-[9px] text-slate-500">{checkedOpIds.length}/{regOps.length} 선택</span>
              </div>
              <div className="bg-slate-800/60 border border-slate-600/60 rounded-xl overflow-hidden max-h-44 overflow-y-auto">
                {regOps.length === 0 ? (
                  <div className="px-4 py-3 text-slate-500 text-xs text-center">등록된 차단기 없음</div>
                ) : regOps.map(op => {
                  const checked = checkedOpIds.includes(op.id);
                  return (
                    <label key={op.id} className={`flex items-center gap-3 px-3 py-2.5 border-b border-slate-700/30 last:border-0 cursor-pointer transition-colors ${checked ? 'bg-indigo-950/40' : 'hover:bg-slate-700/30'}`}>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${checked ? 'bg-[#6B5EF8] border-violet-500' : 'bg-slate-700 border-slate-600'}`}>
                        {checked && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
                      </div>
                      <input type="checkbox" className="hidden" checked={checked} onChange={() => toggleOp(op.id)} />
                      <span className="text-indigo-300 font-mono text-xs font-bold shrink-0">{op.unitId}</span>
                      <span className="text-slate-300 text-xs truncate flex-1">{op.panelName}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 팀 선택 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">팀 선택 <span className="text-red-400">*</span></label>
              <select value={team} onChange={e => setTeam(e.target.value)} className={selectCls}>
                <option value="">— 팀을 선택하세요 —</option>
                {Object.keys(TEAM_DATA).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* 책임자 / 작업자 선택 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">책임자 <span className="text-red-400">*</span></label>
                <select value={supervisor} onChange={e => setSupervisor(e.target.value)} disabled={!team} className={`${selectCls} disabled:opacity-40 disabled:cursor-not-allowed`}>
                  <option value="">— 선택 —</option>
                  {teamInfo?.supervisors.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">작업자 <span className="text-red-400">*</span></label>
                <select value={worker} onChange={e => setWorker(e.target.value)} disabled={!team} className={`${selectCls} disabled:opacity-40 disabled:cursor-not-allowed`}>
                  <option value="">— 선택 —</option>
                  {teamInfo?.workers.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
            </div>

            {/* 확인 정보 (선택 완료 시 표시) */}
            {confirmed && (
              <div className="flex flex-col gap-0 bg-slate-800/60 border border-slate-600/60 rounded-xl overflow-hidden">
                <div className="px-4 py-2 bg-slate-700/40 border-b border-slate-600/40">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">확인 정보</span>
                </div>
                {[
                  { label: '팀', value: team },
                  { label: '책임자', value: supervisor },
                  { label: '작업자', value: worker },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-start gap-3 px-4 py-2.5 border-b border-slate-700/40">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider w-16 shrink-0 pt-0.5">{label}</span>
                    <span className="text-sm text-slate-200 leading-snug">{value}</span>
                  </div>
                ))}
                {/* 선택된 조작 목록 */}
                <div className="flex items-start gap-3 px-4 py-2.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider w-16 shrink-0 pt-0.5">조작대상</span>
                  <div className="flex flex-col gap-1 flex-1">
                    {checkedOpIds.length === 0 ? (
                      <span className="text-xs text-slate-500">선택 없음</span>
                    ) : checkedOpIds.map(id => {
                      const op = regOps.find(o => o.id === id);
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

            <button onClick={() => handleAction('start')} disabled={!confirmed}
              className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold text-sm transition-all shadow-lg shadow-sky-900/20 flex items-center justify-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3" /></svg>
              작업 시작
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default StartModal;
