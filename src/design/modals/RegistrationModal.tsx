import React from 'react';
import { PANEL_DATA } from '../../data/panelData';
import { DEPARTMENTS, REASONS } from '../../data/staffData';
import { createOperation } from '../../api/operationApi';
import { Search, QrCode, X, Info, CheckCircle2 } from 'lucide-react';

export function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest text-left">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

export const REG_SELECT_CLS = "w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none cursor-pointer shadow-sm";

function RegistrationModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = React.useState({
    requestDept: '', reason: '',
  });
  const [selectedPanelIds, setSelectedPanelIds] = React.useState<number[]>([]);
  const [panelSearch, setPanelSearch] = React.useState('');
  const [showSearch, setShowSearch] = React.useState(true);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white border border-gray-100 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* 헤더 */}
        <div className="relative px-8 pt-10 pb-6 flex flex-col items-center border-b border-gray-50">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
            <X size={20} strokeWidth={2.5} />
          </button>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">조작 등록</h2>
          <span className="text-[11px] font-black tracking-[0.3em] text-blue-400 uppercase mt-1">Register</span>
        </div>

        {success ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center border-2 border-emerald-500">
              <CheckCircle2 size={32} className="text-emerald-500" strokeWidth={2.5} />
            </div>
            <p className="text-lg font-bold text-slate-800">조작 등록이 완료되었습니다</p>
          </div>
        ) : (
          <div className="p-8 flex flex-col gap-6">
            <div className="flex flex-col gap-5 text-left">
              <Field label="작업 부서" required>
                <div className="relative">
                  <select value={form.requestDept} onChange={e => sel({ requestDept: e.target.value })} className={REG_SELECT_CLS}>
                    <option value="">부서를 선택하세요</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 1L5 5L9 1" /></svg>
                  </div>
                </div>
              </Field>

              <Field label="작업요청사유" required>
                <div className="relative">
                  <select value={form.reason} onChange={e => sel({ reason: e.target.value })} className={REG_SELECT_CLS}>
                    <option value="">사유를 선택하세요</option>
                    {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 1L5 5L9 1" /></svg>
                  </div>
                </div>
              </Field>
            </div>

            <Field label="차단기 선택" required>
              <div className="flex gap-3 mb-3">
                <button onClick={() => { setShowQR(true); setShowSearch(false); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold border transition-all ${showQR ? 'bg-blue-50 border-blue-500 text-blue-600 shadow-sm shadow-blue-100' : 'bg-white border-gray-200 text-slate-500 hover:bg-gray-50'}`}>
                  <QrCode size={16} />
                  QR 스캔
                </button>
                <button onClick={() => { setShowSearch(true); setShowQR(false); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold border transition-all ${showSearch ? 'bg-blue-50 border-blue-500 text-blue-600 shadow-sm shadow-blue-100' : 'bg-white border-gray-200 text-slate-500 hover:bg-gray-50'}`}>
                  <Search size={16} />
                  검색
                </button>
              </div>

              {showSearch && (
                <div className="flex flex-col gap-3">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input value={panelSearch} onChange={e => setPanelSearch(e.target.value)}
                      placeholder="Unit ID or equipment name..."
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-inner" />
                  </div>

                  <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm bg-white">
                    <div className="grid grid-cols-[1fr_1fr_1fr_0.6fr] px-4 py-2 bg-slate-50/50 border-b border-gray-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">
                      <span>기기번호</span>
                      <span>키상태</span>
                      <span>작업상태</span>
                      <span className="text-right">상세</span>
                    </div>
                    <div className="max-h-48 overflow-y-auto divide-y divide-gray-50">
                      {filtered.map(p => {
                        const checked = selectedPanelIds.includes(p.id);
                        return (
                          <label key={p.id} className={`grid grid-cols-[1fr_1fr_1fr_0.6fr] items-center px-4 py-3 cursor-pointer transition-colors text-left ${checked ? 'bg-blue-50/40' : 'hover:bg-slate-50/30'}`}>
                            <div className="flex items-center gap-3">
                              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${checked ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}>
                                {checked && <CheckCircle2 size={12} className="text-white" strokeWidth={3} />}
                              </div>
                              <input type="checkbox" className="hidden" checked={checked} onChange={() => togglePanel(p.id)} />
                              <span className="text-xs font-bold text-slate-700 font-mono tracking-tight">{p.unitId}</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Key Closed</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">대기</span>
                            <div className="text-right">
                              <button className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded-md text-[9px] font-bold text-slate-500 hover:border-slate-300 transition-colors shadow-sm">
                                <Info size={10} />
                                상세
                              </button>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </Field>

            {selectedPanelIds.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedPanelIds.map(id => (
                  <div key={id} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg shadow-sm">
                    <span className="text-xs font-bold text-blue-600 font-mono">{PANEL_DATA[id]?.unitId}</span>
                    <button onClick={() => togglePanel(id)} className="text-blue-300 hover:text-blue-500 transition-colors"><X size={12} /></button>
                  </div>
                ))}
              </div>
            )}

            <button onClick={handleSubmit} disabled={submitting || !isValid}
              className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-100 disabled:text-slate-400 text-white font-extrabold text-sm tracking-widest transition-all mt-2 shadow-lg shadow-blue-600/20 active:scale-[0.98]">
              {submitting ? 'PROCESSING...' : '조작 등록'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default RegistrationModal;
