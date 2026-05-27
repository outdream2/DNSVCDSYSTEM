import type { ActivePanel } from '../../shared/types';

export async function getActivePanels(): Promise<ActivePanel[]> {
  const res = await fetch('/api/active-panels');
  if (!res.ok) throw new Error(`getActivePanels failed: ${res.status}`);
  const data = await res.json();
  return data.panels ?? [];
}

export async function setActivePanels(panels: Omit<ActivePanel, never>[]): Promise<void> {
  const res = await fetch('/api/active-panels', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(panels),
  });
  if (!res.ok) throw new Error(`setActivePanels failed: ${res.status}`);
}

export async function clearActivePanels(): Promise<void> {
  const res = await fetch('/api/active-panels', { method: 'DELETE' });
  if (!res.ok) throw new Error(`clearActivePanels failed: ${res.status}`);
}
