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

  const selectCls = "w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-blue-500 transition-colors shadow-sm";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white border border-gray-100 rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in duration-200">

        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
          <div className="flex items-center gap-3 text-left">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="#2563eb" /></svg>
            </div>
            <div><p className="text-slate-800 font-bold text-base leading-none">조작 시작</p><p className="text-blue-400 text-[10px] font-black tracking-widest uppercase mt-1">START</p></div>
          </div>
          <button onClick={() => onClose()} className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-red-50 border border-gray-200 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 ${actionType === 'complete' ? 'bg-emerald-50 border-emerald-500' : 'bg-blue-50 border-blue-500'}`}>
              {actionType === 'complete'
                ? <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                : <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="3"><polygon points="5 3 19 12 5 21 5 3" /></svg>}
            </div>
            <p className={`font-bold text-lg ${actionType === 'complete' ? 'text-emerald-600' : 'text-blue-600'}`}>
              {actionType === 'complete' ? '작업 완료 처리됨' : '작업 시작됨'}
            </p>
          </div>
        ) : (
          <div className="p-5 flex flex-col gap-4 text-left">

            {/* 조작 내역 — 체크리스트 (최상단) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between px-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">조작 내역</label>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{checkedOpIds.length}/{regOps.length} SELECTED</span>
              </div>
              <div className="bg-slate-50 border border-gray-100 rounded-xl overflow-hidden max-h-44 overflow-y-auto shadow-inner">
                {regOps.length === 0 ? (
                  <div className="px-4 py-8 text-slate-400 text-[11px] font-bold text-center uppercase tracking-widest">No registered units</div>
                ) : regOps.map(op => {
                  const checked = checkedOpIds.includes(op.id);
                  return (
                    <label key={op.id} className={`flex items-center gap-3 px-3 py-2.5 border-b border-gray-100 last:border-0 cursor-pointer transition-colors ${checked ? 'bg-blue-50/50' : 'hover:bg-white'}`}>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${checked ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}>
                        {checked && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><polyline points="20 6 9 17 4 12" /></svg>}
                      </div>
                      <input type="checkbox" className="hidden" checked={checked} onChange={() => toggleOp(op.id)} />
                      <span className="text-blue-600 font-mono text-xs font-black shrink-0">{op.unitId}</span>
                      <span className="text-slate-600 text-xs truncate flex-1 font-medium">{op.panelName}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 팀 선택 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">팀 선택 <span className="text-red-500">*</span></label>
              <select value={team} onChange={e => setTeam(e.target.value)} className={selectCls}>
                <option value="">— 팀을 선택하세요 —</option>
                {Object.keys(TEAM_DATA).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* 책임자 / 작업자 선택 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">책임자 <span className="text-red-500">*</span></label>
                <select value={supervisor} onChange={e => setSupervisor(e.target.value)} disabled={!team} className={`${selectCls} disabled:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed`}>
                  <option value="">— 선택 —</option>
                  {teamInfo?.supervisors.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">작업자 <span className="text-red-500">*</span></label>
                <select value={worker} onChange={e => setWorker(e.target.value)} disabled={!team} className={`${selectCls} disabled:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed`}>
                  <option value="">— 선택 —</option>
                  {teamInfo?.workers.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
            </div>

            {/* 확인 정보 (선택 완료 시 표시) */}
            {confirmed && (
              <div className="flex flex-col gap-0 bg-white border border-blue-100 rounded-xl overflow-hidden shadow-sm animate-in slide-in-from-top-1 duration-200">
                <div className="px-4 py-2 bg-blue-50/50 border-b border-blue-100">
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Confirm Details</span>
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

            <button onClick={() => handleAction('start')} disabled={!confirmed}
              className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-100 disabled:text-slate-400 text-white font-black text-sm tracking-widest transition-all mt-2 shadow-lg shadow-blue-600/20 active:scale-[0.98] flex items-center justify-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polygon points="5 3 19 12 5 21 5 3" fill="currentColor" /></svg>
              작업 시작
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default StartModal;
