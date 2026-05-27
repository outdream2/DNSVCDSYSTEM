import React from 'react';
import { Operation } from '../../data/types';

function HistoryModal({ onClose }: { onClose: () => void }) {
  const [ops, setOps] = React.useState<Operation[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filterStatus, setFilterStatus] = React.useState('');
  const [filterDate, setFilterDate] = React.useState('');

  React.useEffect(() => {
    const params = new URLSearchParams();
    if (filterStatus) params.set('status', filterStatus);
    if (filterDate) params.set('from', filterDate);
    fetch('/api/operations?' + params.toString())
      .then(r => r.json())
      .then(d => { setOps(d.operations ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [filterStatus, filterDate]);

  const statusColor = (s: string) => {
    if (s === '완료') return 'bg-emerald-900/60 text-emerald-300 border-emerald-700/50';
    if (s === '진행중') return 'bg-sky-900/60 text-sky-300 border-sky-700/50';
    return 'bg-red-900/60 text-red-300 border-red-700/50';
  };
  const typeColor = (t: string) => {
    if (t === 'KEY CLOSED') return 'text-slate-400';
    if (t === 'KEY OPEN') return 'text-emerald-400';
    return 'text-red-500 font-bold';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0f1623] border border-slate-700 rounded-2xl shadow-2xl w-full max-w-3xl mx-4 overflow-hidden flex flex-col max-h-[85vh]">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/60 bg-slate-900/60 shrink-0">
          <div>
            <h2 className="text-white font-bold text-lg tracking-tight">이력 조회</h2>
            <p className="text-slate-400 text-xs mt-0.5">HISTORY</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-red-900/60 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        {/* 필터 */}
        <div className="flex items-center gap-3 px-6 py-3 border-b border-slate-800 bg-slate-900/30 shrink-0">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-slate-300 text-xs focus:outline-none focus:border-indigo-500">
            <option value="">전체 상태</option>
            <option value="완료">완료</option>
            <option value="진행중">진행중</option>
            <option value="실패">실패</option>
          </select>
          <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
            className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-slate-300 text-xs focus:outline-none focus:border-indigo-500" />
          {(filterStatus || filterDate) && (
            <button onClick={() => { setFilterStatus(''); setFilterDate(''); }} className="text-xs text-slate-500 hover:text-white transition-colors">초기화</button>
          )}
          <span className="ml-auto text-xs text-slate-500">{ops.length}건</span>
        </div>

        {/* 테이블 */}
        <div className="overflow-y-auto flex-1 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-500 text-sm">로딩 중...</div>
          ) : ops.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-slate-600 text-sm">데이터 없음</div>
          ) : (
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-slate-900/90 backdrop-blur-sm">
                <tr className="border-b border-slate-700/60">
                  {['대상기기', '대상기기명', '키상태', '조작자', '일시', '작업상태'].map(h => (
                    <th key={h} className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ops.map((op, i) => (
                  <tr key={op.id} className={`border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-900/20'}`}>
                    <td className="px-3 py-2.5 text-indigo-300 font-mono font-bold whitespace-nowrap">{op.unitId}</td>
                    <td className="px-3 py-2.5 text-slate-300 max-w-[160px] truncate">{op.panelName}</td>
                    <td className={`px-3 py-2.5 font-bold whitespace-nowrap ${typeColor(op.opType)}`}>{op.opType}</td>
                    <td className="px-3 py-2.5 text-slate-300 whitespace-nowrap">{op.operator}</td>
                    <td className="px-3 py-2.5 text-slate-400 whitespace-nowrap font-mono">{op.operatedAt.replace('T', ' ').slice(0, 16)}</td>
                    <td className="px-3 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${statusColor(op.status)}`}>{op.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default HistoryModal;
