import React, { useState, useEffect } from 'react';
import { ActivePanel, Operation } from '../../data/types';

function Header({ targetPanels, statusOps }: { targetPanels: ActivePanel[]; statusOps: Operation[] }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="relative flex items-center justify-between px-5 py-0 shrink-0 overflow-hidden rounded-xl bg-white border border-gray-200 shadow-sm">

      {/* 왼쪽: 로고 + 타이틀 */}
      <div className="flex items-center gap-4 py-2.5 z-10">
        <div className="flex flex-col gap-[3px]">
          <div className="w-[3px] h-4 rounded-full bg-blue-600" />
          <div className="w-[3px] h-2 rounded-full bg-blue-300" />
          <div className="w-[3px] h-1 rounded-full bg-blue-100" />
        </div>
        <div className="flex flex-col gap-[2px]">
          <div className="flex items-center gap-2">
            <span className="text-[8px] font-bold tracking-[0.4em] uppercase text-blue-500">YEONGDONG POWER PLANT · UNIT 1</span>
            <div className="h-px w-8 bg-gradient-to-r from-blue-300/60 to-transparent" />
          </div>
          <span className="text-[15px] font-bold tracking-[0.02em] text-gray-900">
            영동 1호기 고압차단기 위치안내시스템
          </span>
        </div>
      </div>

      {/* 오른쪽: 상태정보 + 시간 */}
      <div className="flex items-center gap-2 z-10">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-50 border border-gray-200">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>
          <span className="text-[9px] font-bold text-emerald-600">정상가동</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-50 border border-gray-200">
          <div className={`w-1.5 h-1.5 rounded-full ${targetPanels.length > 0 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
          <span className="text-[9px] font-bold text-gray-500">알람</span>
          {targetPanels.length > 0
            ? <span className="text-[9px] font-bold text-red-500">{targetPanels.length}건</span>
            : <span className="text-[9px] font-bold text-emerald-600">없음</span>}
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-50 border border-gray-200">
          <span className="text-[9px] font-bold text-gray-500">패널</span>
          <span className="text-[9px] font-bold text-blue-600">47</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-50 border border-gray-200">
          <span className="text-[9px] font-bold text-gray-500">월간</span>
          <span className="text-[9px] font-bold text-violet-600">{statusOps.filter(o => { const d = new Date(o.operatedAt); return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth(); }).length}건</span>
        </div>
        <div className="w-px h-5 bg-gray-200" />
        <span className="text-[12px] font-mono font-bold text-blue-600">
          {now.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '.').replace(/\.$/, '')}
          &nbsp;
          {now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
        </span>
      </div>
    </div>
  );
}

export default Header;
