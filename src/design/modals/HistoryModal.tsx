import React from 'react';
import { Operation } from '../../data/types';
import { getOperations } from '../../api/operationApi';

function HistoryModal({ onClose }: { onClose: () => void }) {
  const [ops, setOps] = React.useState<Operation[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filterStatus, setFilterStatus] = React.useState('');
  const [filterDate, setFilterDate] = React.useState('');

  React.useEffect(() => {
    setLoading(true);
    getOperations({ status: filterStatus || undefined, from: filterDate || undefined })
      .then(ops => { setOps(ops); setLoading(false); })
      .catch(() => setLoading(false));
  }, [filterStatus, filterDate]);

  const statusColor = (s: string) => {
    if (s === '완료') return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    if (s === '진행중') return 'bg-blue-50 text-blue-600 border-blue-100';
    return 'bg-red-50 text-red-600 border-red-100';
  };
  const typeColor = (t: string) => {
    if (t === 'KEY CLOSED') return 'text-slate-400';
    if (t === 'KEY OPEN') return 'text-emerald-500 font-bold';
    return 'text-red-500 font-bold';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
      <div className="bg-white border border-gray-100 rounded-3xl shadow-2xl w-full max-w-3xl mx-4 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-200">
        
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white shrink-0">
          <div className="text-left">
            <h2 className="text-slate-800 font-black text-lg tracking-tight">이력 조회</h2>
            <p className="text-blue-400 text-[10px] font-black tracking-widest uppercase">HISTORY</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-red-50 border border-gray-200 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        {/* 필터 */}
        <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-50 bg-slate-50/50 shrink-0">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-slate-700 text-xs focus:outline-none focus:border-blue-500 shadow-sm">
            <option value="">전체 상태</option>
            <option value="완료">완료</option>
            <option value="진행중">진행중</option>
            <option value="실패">실패</option>
          </select>
          <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-slate-700 text-xs focus:outline-none focus:border-blue-500 shadow-sm" />
          {(filterStatus || filterDate) && (
            <button onClick={() => { setFilterStatus(''); setFilterDate(''); }} className="text-xs font-bold text-blue-500 hover:text-red-500 transition-colors uppercase tracking-widest ml-2">Reset</button>
          )}
          <span className="ml-auto text-[10px] font-black text-slate-400 uppercase tracking-tighter">{ops.length} RECORDS FOUND</span>
        </div>

        {/* 테이블 */}
        <div className="overflow-y-auto flex-1 min-h-0 bg-white">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-slate-400 text-sm font-bold uppercase tracking-widest">Loading Records...</div>
          ) : ops.length === 0 ? (
            <div className="flex items-center justify-center py-20 text-slate-300 text-sm font-bold uppercase tracking-widest">No data available</div>
          ) : (
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-white shadow-sm z-10">
                <tr className="border-b border-gray-100">
                  {['대상기기', '대상기기명', '키상태', '조작자', '일시', '작업상태'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {ops.map((op, i) => (
                  <tr key={op.id} className={`hover:bg-blue-50/30 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-50/30'}`}>
                    <td className="px-4 py-3.5 text-blue-600 font-mono font-black whitespace-nowrap">{op.unitId}</td>
                    <td className="px-4 py-3.5 text-slate-700 font-bold max-w-[160px] truncate">{op.panelName}</td>
                    <td className={`px-4 py-3.5 font-black whitespace-nowrap uppercase tracking-tighter ${typeColor(op.opType)}`}>{op.opType}</td>
                    <td className="px-4 py-3.5 text-slate-600 font-bold uppercase tracking-tighter">{op.operator}</td>
                    <td className="px-4 py-3.5 text-slate-400 whitespace-nowrap font-mono font-medium tracking-tight">{op.operatedAt.replace('T', ' ').slice(0, 16)}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-wider ${statusColor(op.status)}`}>{op.status}</span>
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
