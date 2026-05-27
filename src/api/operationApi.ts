import type { Operation } from '../../shared/types';

export interface OperationFilter {
  status?: string;
  panelId?: number;
  from?: string;
  to?: string;
}

export interface CreateOperationPayload {
  panelId: number;
  unitId: string;
  panelName: string;
  opType: Operation['opType'];
  operator: string;
  department: string;
  purpose: string;
  notes: string;
}

export async function getOperations(filter: OperationFilter = {}): Promise<Operation[]> {
  const params = new URLSearchParams();
  if (filter.status)   params.set('status',   filter.status);
  if (filter.panelId)  params.set('panelId',  String(filter.panelId));
  if (filter.from)     params.set('from',     filter.from);
  if (filter.to)       params.set('to',       filter.to);

  const res = await fetch(`/api/operations?${params}`);
  if (!res.ok) throw new Error(`getOperations failed: ${res.status}`);
  const data = await res.json();
  return data.operations ?? [];
}

export async function createOperation(payload: CreateOperationPayload): Promise<Operation> {
  const res = await fetch('/api/operations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`createOperation failed: ${res.status}`);
  const data = await res.json();
  return data.operation;
}

export async function completeOperations(ids: number[]): Promise<void> {
  const res = await fetch('/api/operations/complete', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) throw new Error(`completeOperations failed: ${res.status}`);
}
