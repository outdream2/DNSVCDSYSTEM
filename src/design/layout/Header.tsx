import React, { useState, useEffect } from 'react';
import { ActivePanel, Operation } from '../../data/types';

function Header({ targetPanels, statusOps }: { targetPanels: ActivePanel[]; statusOps: Operation[] }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="relative flex items-center justify-between px-5 py-0 shrink-0 overflow-hidden rounded-xl"
      style={{ background: 'linear-gradient(90deg, #020d1f 0%, #0a1e3a 30%, #061429 60%, #020d1f 100%)', borderTop: '1px solid rgba(56,189,248,0.25)', borderBottom: '1px solid rgba(56,189,248,0.12)', boxShadow: '0 0 40px rgba(14,165,233,0.12), inset 0 1px 0 rgba(56,189,248,0.08)' }}>


      {/* 왼쪽: 로고 + 타이틀 */}
      <div className="flex items-center gap-4 py-2.5 z-10">
        {/* 수직 액센트 바 */}
        <div className="flex flex-col gap-[3px]">
          <div className="w-[3px] h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #38bdf8, #0ea5e9)' }} />
          <div className="w-[3px] h-2 rounded-full bg-sky-700" />
          <div className="w-[3px] h-1 rounded-full bg-sky-900" />
        </div>
        <div className="flex flex-col gap-[2px]">
          <div className="flex items-center gap-2">
            <span className="text-[8px] font-bold tracking-[0.4em] uppercase" style={{ color: '#38bdf8', opacity: 0.7 }}>YEONGDONG POWER PLANT · UNIT 1</span>
            <div className="h-px w-8 bg-gradient-to-r from-sky-500/50 to-transparent" />
          </div>
          <span className="text-[15px] font-bold tracking-[0.04em] text-white" style={{ textShadow: '0 0 20px rgba(56,189,248,0.3)' }}>
            영동 1호기 고압차단기 위치안내시스템
          </span>
        </div>
      </div>

      {/* 오른쪽: 상태정보 + 시간 */}
      <div className="flex items-center gap-2 z-10">
        {/* 시스템 */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-800/60 border border-slate-700/50">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>
          <span className="text-[9px] font-bold text-emerald-400">정상가동</span>
        </div>
        {/* 알람 */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-800/60 border border-slate-700/50">
          <div className={`w-1.5 h-1.5 rounded-full ${targetPanels.length > 0 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
          <span className="text-[9px] font-bold text-slate-500">알람</span>
          {targetPanels.length > 0
            ? <span className="text-[9px] font-bold text-red-400">{targetPanels.length}건</span>
            : <span className="text-[9px] font-bold text-emerald-400">없음</span>}
        </div>
        {/* 패널 */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-800/60 border border-slate-700/50">
          <span className="text-[9px] font-bold text-slate-500">패널</span>
          <span className="text-[9px] font-bold text-sky-400">47</span>
        </div>
        {/* 월간이력 */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-800/60 border border-slate-700/50">
          <span className="text-[9px] font-bold text-slate-500">월간</span>
          <span className="text-[9px] font-bold text-violet-400">{statusOps.filter(o => { const d = new Date(o.operatedAt); return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth(); }).length}건</span>
        </div>
        {/* 구분선 */}
        <div className="w-px h-5 bg-sky-900/60" />
        {/* 날짜 + 시간 */}
        <span className="text-[12px] font-mono font-bold text-sky-300" style={{ textShadow: '0 0 10px rgba(56,189,248,0.4)' }}>
          {now.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '.').replace(/\.$/, '')}
          &nbsp;
          {now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
        </span>
      </div>

      {/* 오른쪽 끝 글로우 */}
      <div className="absolute right-0 top-0 bottom-0 w-32 pointer-events-none" style={{ background: 'linear-gradient(90deg, transparent, rgba(14,165,233,0.04))' }} />
    </div>
  );
}

export default Header;
