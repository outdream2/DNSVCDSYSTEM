import React from 'react';
import { PANEL_DATA } from '../../data/panelData';
import { DEPARTMENTS, REASONS } from '../../data/staffData';
import { createOperation } from '../../api/operationApi';

export function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

export const REG_SELECT_CLS = "bg-slate-800 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors appearance-none cursor-pointer";

function RegistrationModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = React.useState({
    requestDept: '', reason: '',
  });
  const [selectedPanelIds, setSelectedPanelIds] = React.useState<number[]>([]);
  const [panelSearch, setPanelSearch] = React.useState('');
  const [showSearch, setShowSearch] = React.useState(false);
  const [showQR, setShowQR] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const panelOptions = Object.entries(PANEL_DATA).map(([id, info]) => ({ id: Number(id), unitId: info.unitId, name: info.name }));
  const filtered = panelSearch.length > 0
    ? panelOptions.filter(p => p.unitId.toLowerCase().includes(panelSearch.toLowerCase()) || p.name.toLowerCase().includes(panelSearch.toLowerCase()) || String(p.id).includes(panelSearch))
    : panelOptions;

  const togglePanel = (id: number) =>
    setSelectedPanelIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const sel = (f: Partial<typeof form>) => setForm(prev => ({ ...prev, ...f }));
  const isValid = form.requestDept && form.reason && selectedPanelIds.length > 0;

  const handleSubmit = async () => {
    if (!isValid) return;
    setSubmitting(true);
    try {
      await Promise.all(selectedPanelIds.map(pid => {
        const info = PANEL_DATA[pid];
        return createOperation({
          panelId: pid, unitId: info?.unitId ?? '', panelName: info?.name ?? '',
          opType: 'KEY CLOSED', operator: form.requestDept, department: form.requestDept,
          purpose: form.reason, notes: '',
        });
      }));
      setSuccess(true);
      setTimeout(onClose, 1400);
    } catch { setSubmitting(false); }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#0f1623] border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">

        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900/70 border-b border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#6B5EF8]/20 border border-[#6B5EF8]/40 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
            </div>
            <div><p className="text-white font-bold text-base">조작 등록</p><p className="text-slate-500 text-[10px] tracking-widest uppercase">REGISTER</p></div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-red-900/60 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <p className="text-emerald-400 font-bold">조작 등록 완료</p>
          </div>
        ) : (
          <div className="p-5 flex flex-col gap-4">

            {/* 작업요청부서 / 작업요청사유 나란히 */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="작업요청부서" required>
                <select value={form.requestDept} onChange={e => sel({ requestDept: e.target.value })} className={REG_SELECT_CLS}>
                  <option value="">— 선택 —</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </Field>
              <Field label="작업요청사유" required>
                <select value={form.reason} onChange={e => sel({ reason: e.target.value })} className={REG_SELECT_CLS}>
                  <option value="">— 선택 —</option>
                  {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </Field>
            </div>

            {/* 차단기 선택 */}
            <Field label="차단기 선택" required>
              <div className="flex gap-2">
                <button onClick={() => { setShowQR(true); setShowSearch(false); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold border transition-all ${showQR ? 'bg-[#6B5EF8] border-violet-500 text-white' : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-500'}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="3" height="3" /><rect x="18" y="18" width="3" height="3" /></svg>
                  QR 스캔
                </button>
                <button onClick={() => { setShowSearch(true); setShowQR(false); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold border transition-all ${showSearch ? 'bg-[#6B5EF8] border-violet-500 text-white' : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-500'}`}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                  검색
                </button>
              </div>

              {/* QR 패널 */}
              {showQR && (
                <div className="flex flex-col items-center gap-3 p-4 bg-slate-800/60 border border-slate-700 rounded-xl mt-1">
                  <div className="w-36 h-36 bg-white rounded-xl flex items-center justify-center">
                    <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
                      <rect x="5" y="5" width="35" height="35" rx="4" fill="#1a1a2e" /><rect x="12" y="12" width="21" height="21" rx="2" fill="white" /><rect x="18" y="18" width="9" height="9" fill="#1a1a2e" />
                      <rect x="60" y="5" width="35" height="35" rx="4" fill="#1a1a2e" /><rect x="67" y="12" width="21" height="21" rx="2" fill="white" /><rect x="73" y="18" width="9" height="9" fill="#1a1a2e" />
                      <rect x="5" y="60" width="35" height="35" rx="4" fill="#1a1a2e" /><rect x="12" y="67" width="21" height="21" rx="2" fill="white" /><rect x="18" y="73" width="9" height="9" fill="#1a1a2e" />
                      <rect x="60" y="60" width="9" height="9" fill="#1a1a2e" /><rect x="75" y="60" width="9" height="9" fill="#1a1a2e" /><rect x="60" y="75" width="9" height="9" fill="#1a1a2e" /><rect x="75" y="75" width="9" height="9" fill="#1a1a2e" />
                      <rect x="45" y="45" width="9" height="9" fill="#1a1a2e" />
                    </svg>
                  </div>
                  <p className="text-slate-400 text-xs text-center">바코드를 인식시켜 주세요</p>
                </div>
              )}

              {/* 검색 + 체크리스트 */}
              {showSearch && (
                <div className="flex flex-col gap-2 mt-1">
                  <input value={panelSearch} onChange={e => setPanelSearch(e.target.value)}
                    placeholder="기기번호 또는 기기명 검색..."
                    className="bg-slate-800 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors" />
                  <div className="max-h-52 overflow-y-auto flex flex-col gap-0.5 bg-slate-900 border border-slate-700 rounded-xl p-1.5">
                    {filtered.length === 0 ? (
                      <p className="text-slate-500 text-xs text-center py-3">검색 결과 없음</p>
                    ) : filtered.map(p => {
                      const checked = selectedPanelIds.includes(p.id);
                      return (
                        <label key={p.id} className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${checked ? 'bg-indigo-950/50' : 'hover:bg-slate-800'}`}>
                          <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors shrink-0 ${checked ? 'bg-[#6B5EF8] border-violet-500' : 'bg-slate-700 border-slate-600'}`}>
                            {checked && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
                          </div>
                          <input type="checkbox" className="hidden" checked={checked} onChange={() => togglePanel(p.id)} />
                          <span className="text-slate-500 font-mono text-xs w-5 shrink-0">{String(p.id).padStart(2, '0')}</span>
                          <span className="text-indigo-300 font-mono text-xs font-bold shrink-0">{p.unitId}</span>
                          <span className="text-slate-300 text-xs truncate">{p.name}</span>
                        </label>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs text-slate-500">{selectedPanelIds.length}개 선택됨</span>
                    {selectedPanelIds.length > 0 && (
                      <button onClick={() => setSelectedPanelIds([])} className="text-[11px] text-slate-500 hover:text-red-400 transition-colors">전체 해제</button>
                    )}
                  </div>
                </div>
              )}

              {/* 선택된 차단기 태그 목록 */}
              {selectedPanelIds.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedPanelIds.map(id => {
                    const info = PANEL_DATA[id];
                    return (
                      <div key={id} className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-950/50 border border-indigo-800/50 rounded-lg">
                        <span className="text-indigo-300 font-mono text-[11px] font-bold">{info?.unitId}</span>
                        <button onClick={() => togglePanel(id)} className="text-slate-500 hover:text-red-400 transition-colors text-[11px] leading-none">✕</button>
                      </div>
                    );
                  })}
                </div>
              )}
            </Field>

            {/* 제출 */}
            <button onClick={handleSubmit} disabled={submitting || !isValid}
              className="w-full py-3 rounded-xl bg-[#6B5EF8] hover:bg-[#7B6EFF] disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold text-sm transition-all mt-1 shadow-lg shadow-violet-900/30">
              {submitting ? '등록 중...' : '조작 등록'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default RegistrationModal;
